const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
const yahooFinance = require("yahoo-finance2").default;
const { formatDate, getBeforeDate } = require("../lib/utils");
const { div } = require("@tensorflow/tfjs");

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms)); // needed to not go over api call limit
};

router.get("/tickers", async (req, res) => {
  response = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": "Santi Criado (santiagocriado@meta.com)" },
  });
  const data = await response.json();
  for (const key of Object.keys(data)) {
    const value = data[key];
    const company = await prisma.company.findFirst({
      where: { cik_number: parseInt(value.cik_str) },
    });
    if (company === null) {
      await prisma.company.create({
        data: {
          cik_number: parseInt(value.cik_str),
          ticker: value.ticker,
          name: value.title,
          daily_price: 0,
        },
      });
    }
  }

  res.status(200).json({ message: "got all the way here" });
});

const FORM_TYPE = { tenk: "10-K", eightk: "8-K", tenq: "10-Q" };

router.post("/companyfill", async (req, res) => {
  const companies = await prisma.company.findMany();
  const length = companies.length;
  let i = 0;
  for (const company of companies) {
    const isSuccess = await companyFillHelper(company.cik_number);
    await wait(100);
    i++;
    const percentDone = ((i / companies.length) * 100).toFixed(3);
  }
  res.status(200).json({ message: "Successfully Populated database!" });
});

// populate company information!!!
router.post("/companyfill/:cik_number", async (req, res) => {
  const cik = parseInt(req.params.cik_number);
  const paddedCik = cik.toString().padStart(10, "0");
  const company = await prisma.company.findUnique({
    where: { cik_number: cik },
  });
  if (company === null) {
    return res.status(400).json({
      error: "company not yet in databse, or not registered on the SEC",
    });
  }
  const response = await fetch(
    `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
    {
      headers: { "User-Agent": "Santi Criado (santiagocriado@meta.com)" },
    }
  );
  const data = await response.json();
  const filings = data.filings.recent;
  const length = data.filings.recent.accessionNumber.length;
  for (let i = 0; i < length; i++) {
    if (
      filings.form[i] === FORM_TYPE.tenk ||
      filings.form[i] === FORM_TYPE.eightk ||
      filings.form[i] === FORM_TYPE.tenq
    ) {
      const newDocument = await prisma.document.create({
        data: {
          type: filings.form[i],
          url: `https://www.sec.gov/Archives/edgar/data/${cik}/${filings.accessionNumber[
            i
          ].replaceAll("-", "")}/${filings.primaryDocument[i]}`,
          filed_date: new Date(filings.filingDate[i]),
          companyId: company.id,
        },
      });
    }
  }
  res.status(200).json({ message: "got all the way here" });
});

const companyFillHelper = async (cik) => {
  const company = await prisma.company.findUnique({
    where: { cik_number: cik },
  });
  if (company === null) {
    return false;
  }
  const paddedCik = cik.toString().padStart(10, "0");
  const response = await fetch(
    `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
    {
      headers: { "User-Agent": "Santi Criado (santiagocriado@meta.com)" },
    }
  );
  const data = await response.json();
  const filings = data.filings.recent;
  const length = data.filings.recent.accessionNumber.length;
  for (let i = 0; i < length; i++) {
    if (
      filings.form[i] === FORM_TYPE.tenk ||
      filings.form[i] === FORM_TYPE.eightk ||
      filings.form[i] === FORM_TYPE.tenq
    ) {
      const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${filings.accessionNumber[
        i
      ].replaceAll("-", "")}/${filings.primaryDocument[i]}`;
      const isAlreadyIn = await prisma.document.findFirst({
        where: { url },
      });
      if (!isAlreadyIn) {
        const newDocument = await prisma.document.create({
          data: {
            type: filings.form[i],
            url,
            filed_date: new Date(filings.filingDate[i]),
            companyId: company.id,
          },
        });
      }
    }
  }
};

// assign sector and industry denominations to database
router.post("/industry-sector-desc-fill", async (req, res) => {
  const companies = await prisma.company.findMany();
  let ind = 0;
  for (let company of companies) {
    let companyInfo;
    try {
      companyInfo = await yahooFinance.quoteSummary(company.ticker, {
        modules: ["assetProfile"],
      });
    } catch (err) {
      continue;
    }
    // check existing
    if (companyInfo.assetProfile.sector == null) {
      continue;
    }
    const existing = await prisma.sector.findUnique({
      where: {
        name: companyInfo.assetProfile.sector,
      },
    });
    if (existing == null) {
      const newSector = await prisma.sector.create({
        data: {
          name: companyInfo.assetProfile.sector,
        },
      });
      // sector does not exist, so it is therefore impossible that corresponding industies yet exist, so no need to check
      const newIndustry = await prisma.industry.create({
        data: {
          name: companyInfo.assetProfile.industry,
          sectorId: newSector.id,
        },
      });
      await updateCompany(
        company,
        newIndustry.id,
        companyInfo.assetProfile.longBusinessSummary
      );
    } else {
      // sector already exists, so the industry could already exist.
      const existingIndustry = await prisma.industry.findUnique({
        where: {
          name: companyInfo.assetProfile.industry,
        },
      });
      if (existingIndustry == null) {
        const newIndustry = await prisma.industry.create({
          data: {
            name: companyInfo.assetProfile.industry,
            sectorId: existing.id,
          },
        });
        await updateCompany(
          company,
          newIndustry.id,
          companyInfo.assetProfile.longBusinessSummary
        );
      } else {
        await updateCompany(
          company,
          existingIndustry.id,
          companyInfo.assetProfile.longBusinessSummary
        );
      }
    }
    ind++;
    await wait(40);
  }
  res.json({ message: "done" });
});

// batch calls for companies, used for TC 1:

const BATCH_SIZE = 100;
const MAX_BETWEEN_TIME_PRICE = 1000 * 60 * 90; // 1.5 hr update cycle, don't want to get ip banned from yfinance -> no batch call for yfinance js unfortunately
router.post("/", async (req, res) => {
  await updateAllCompanies();
  res.json({ message: "prices updated" });
});

const updateAllCompanies = async () => {
  const mostRecent = await prisma.company.findFirst({
    orderBy: {
      lastUpdate: "desc",
    },
  });
  const currentTime = new Date();
  if (
    Math.abs(mostRecent.lastUpdate.getTime() - currentTime.getTime()) <
    MAX_BETWEEN_TIME_PRICE
  ) {
    return;
  }
  const allCompanies = await prisma.company.findMany();
  const onlyTickers = allCompanies.map((value) => value.ticker);
  let currentInd = 0;
  while (true) {
    // to prevent yfinance crash
    batchSplit = onlyTickers.slice(currentInd, currentInd + BATCH_SIZE);
    if (batchSplit.length == 0) {
      break;
    }
    const prices = await yahooFinance.quote(
      batchSplit,
      { modules: ["price"] },
      { validateResult: false }
    );
    const firstDate = formatDate(getBeforeDate(""));
    const secondDate = formatDate(new Date());
    const options = {
      period1: firstDate,
      period2: secondDate,
      events: "dividends",
    };
    const dividends = [];
    for (let ticker of batchSplit) {
      await wait(200);
      try {
        const rep = (await yahooFinance.chart(ticker, options)).events
          .dividends;
        dividends.push(rep);
      } catch (err) {
        dividends.push(null);
      }
    }
    currentInd += BATCH_SIZE;
    for (let i = 0; i < prices.length; i++) {
      const company = prices[i];
      if (dividends[i] == null) {
        await prisma.company.update({
          where: {
            ticker: company.symbol,
          },
          data: {
            daily_price: company.regularMarketPrice,
            daily_price_change: company.regularMarketChangePercent,
            lastUpdate: new Date(),
          },
        });
      } else {
        const dividendsDateList = dividends[i].map((val) => val.date);
        const dividendsAmountList = dividends[i].map((val) => val.amount);
        await prisma.company.update({
          where: {
            ticker: company.symbol,
          },
          data: {
            daily_price: company.regularMarketPrice,
            daily_price_change: company.regularMarketChangePercent,
            lastUpdate: new Date(),
            dividends: dividendsAmountList,
            dividendsDates: dividendsDateList,
          },
        });
      }
    }
  }
};

// helper functions below

const updateCompany = async (company, industryId, description) => {
  await prisma.company.update({
    where: {
      id: company.id,
    },
    data: {
      industryId,
      description,
    },
  });
};

module.exports = { router, updateAllCompanies };
