const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });

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
          recent_news: [],
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
    console.log(i);
    const isSuccess = await companyFillHelper(company.cik_number);
    i++;
    console.log(`handling ${company.name} data`);
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
    console.log("failure point");
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

module.exports = router;
