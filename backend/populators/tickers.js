const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
const yahooFinance = require("yahoo-finance2").default;

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
      const newUser = await prisma.company.create({
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

CONST_FORM_TYPE = { tenk: "10-K", eightk: "8-K", tenq: "10-Q" };

router.post("/companyfill", async (req, res) => {
  const companies = await prisma.company.findMany();
  let i = 0;
  for (const company of companies) {
    const isSuccess = await companyFillHelper(company.cik_number);
    i++;
    console.log(i + "/" + 7700);
    await wait(100);
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
      filings.form[i] === CONST_FORM_TYPE.tenk ||
      filings.form[i] === CONST_FORM_TYPE.eightk ||
      filings.form[i] === CONST_FORM_TYPE.tenq
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
      filings.form[i] === CONST_FORM_TYPE.tenk ||
      filings.form[i] === CONST_FORM_TYPE.eightk ||
      filings.form[i] === CONST_FORM_TYPE.tenq
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
router.post("/sectorfill", async (req, res) => {
  const companies = await prisma.company.findMany();
  for (let company of companies) {
    const companyInfo = await yahooFinance.quoteSummary(company.ticker, {
      modules: ["assetProfile"],
    });
    console.log(companyInfo);
    res.json(companyInfo);
    await prisma.industry.create({
      name: companyInfo.industry,
    });
    return;
  }
  const ticker = req.params.companyTick;
  const result = await yahooFinance.info(ticker);
  if (result === null) {
    res.status(404).json({ message: "ticker does not exist" });
  }
});

// assign sector and industry denominations to database
router.post("/industrysectorfill", async (req, res) => {
  const companies = await prisma.company.findMany();
  let ind = 0;
  console.log("got here?");
  for (let company of companies) {
    let companyInfo;
    try {
      companyInfo = await yahooFinance.quoteSummary(company.ticker, {
        modules: ["assetProfile"],
      });
    } catch (err) {
      console.warn(`Skipping ${company.name} due to yfinance error`);
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
      await updateCompany(company, newIndustry.id);
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
        await updateCompany(company, newIndustry.id);
      } else {
        await updateCompany(company, existingIndustry.id);
      }
    }
    ind++;
    await wait(40);
    console.log(ind + "/7700");
  }
  res.json({ message: "done" });
});

const updateCompany = async (company, industryId) => {
  await prisma.company.update({
    where: {
      id: company.id,
    },
    data: {
      industryId,
    },
  });
};

module.exports = router;
