const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
const yahooFinance = require("yahoo-finance2").default;

router.get("/:companyTick", async (req, res) => {
  const ticker = req.params.companyTick;
  const result = await yahooFinance.quote(ticker);
  if (result === null) {
    res.status(404).json({ message: "ticker does not exist " });
  }
  res.status(200).json(result);
});

router.get("/explore", async (req, res) => {
  // will add more complicated logic in later iterations
  res.json(
    await prisma.company.findMany({
      orderBy: {
        created_at: "asc",
      },
      take: 8,
    })
  );
});

module.exports = router;
