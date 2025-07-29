const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router({ mergeParams: true });

const finnhub = require("finnhub");
const finnhubClient = new finnhub.DefaultApi(process.env.finnhubKey);

// generate excel spreadsheet for company id!
router.put("/generate-model-tcm/:id", async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await prisma.company.findUnique({
    where: {
      id: 1,
    },
  });
  console.log(company.ticker);
  finnhubClient.financialsReported(
    { symbol: company.ticker },
    (error, data, response) => {
      console.log(data);
      res.json(data);
    }
  );
});

module.exports = router;
