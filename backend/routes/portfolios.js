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

  if (!userId) {
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

router.delete("/:id", async (req, res) => {
  const portfolioId = parseInt(req.params.id);
  const portfolio = await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });
  if (portfolio == null) {
    res.status(400).json({ message: "failed to delete" });
  }
  res.json(portfolio);
});

// delete company from portfolio
router.delete("/:id/:companyId", async (req, res) => {
  const portfolioId = parseInt(req.params.id);
  const companyId = parseInt(req.params.companyId);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });
  const array = portfolio.companiesIds.filter((val) => val !== companyId);

  const updatedPortfolio = await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      companiesIds: array,
    },
  });

  if (updatedPortfolio == null) {
    res.status(400).json({ message: "failed to delete" });
  }
  res.json(updatedPortfolio);
});

router.get("/:id", async (req, res) => {
  const portfolioId = parseInt(req.params.id);

  const userId = req.session.userId;

  if (userId == null) {
    res.status(401).json({ message: "you are not logged in" });
  }

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (userId !== portfolio.userId) {
    res
      .status(401)
      .json({ message: "you do not have permission to access this portfolio" });
  }
  if (portfolio == null) {
    res.status(400).json({ message: "failed to get" });
  }
  res.json(portfolio);
});

// add company to portfolio

router.put("/add/:id/:companyId", async (req, res) => {
  const portfolioId = parseInt(req.params.id);
  const companyId = parseInt(req.params.companyId);

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (portfolio.companiesIds.includes(companyId)) {
    res.status(400).json({ message: "this id is already in the array" });
    return;
  }

  const newPortfolio = await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      companiesIds: { push: companyId },
    },
  });
  res.status(200).json(newPortfolio);
});

// x largest swings in portfolio

router.get("/swings/:portfolioId", async (req, res) => {
  const portfolioId = parseInt(req.params.portfolioId);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });
  const idArray = portfolio.companiesIds;
});

module.exports = router;
