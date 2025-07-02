const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const { all } = require("./auth");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
require("dotenv").config();

// make new portfolio

router.post("/", async (req, res) => {
  const userId = req.session.userId;
  const { name, description } = req.body;

  if (!UserID) {
    res.status(401).json({ message: "not logged in" });
  }

  const newPortfolio = await prisma.portfolio.create({
    data: {
      name,
      description,
      companiesIds: [],
      userId,
    },
  });
  res.status(200).json(newPortfolio);
});

router.get("/", async (req, res) => {
  const userId = req.session.userId;
  const allPortfolios = await prisma.portfolio.findMany({
    where: {
      userId,
    },
  });
  if (allPortfolios == null) {
    res.status(200).json({ message: "this user has no current portfolios" });
  }
  res.status(200).json(allPortfolios);
});

module.exports = router;
