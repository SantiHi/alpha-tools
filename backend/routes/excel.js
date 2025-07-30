const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const ExcelJS = require("exceljs");
const router = express.Router({ mergeParams: true });

const finnhub = require("finnhub");
const finnhubClient = new finnhub.DefaultApi(process.env.finnhubKey);

// generate excel spreadsheet for company id!
router.put("/generate-model-tcm/:id", async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const numYears = parseInt(req.body.years);
  const worksheet = workbook.addWorksheet("Historicals");
  const companyId = parseInt(req.params.id);
  const seenHeaders = {};
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });
  finnhubClient.financialsReported(
    { symbol: company.ticker },
    async (error, data, response) => {
      for (let i = 0; i < numYears; i++) {
        const report = data.data[i].report;
        if (data.data[i] == null) {
          break;
        }
        const finStatements = [report.bs, report.ic, report.cf];

        for (let statement of finStatements) {
          for (let item of statement) {
            if ((seenHeaders[item.concept] = true)) {
              const row = [item.label];
              for (let j = 0; j < numYears; j++) {
                const r = data.data[j].report;
                const found =
                  r.bs.find((x) => x.concept === item.concept) ||
                  r.ic.find((x) => x.concept === item.concept) ||
                  r.cf.find((x) => x.concept === item.concept);
                row.push(found ? found.value : null);
              }
              worksheet.addRow(row);
            }
          }
        }
      }
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        `Content-Disposition`,
        `attachment; filename=historicals-${company.ticker}.xlsx`
      );
      res.send(buffer);
    }
  );
});

module.exports = router;
