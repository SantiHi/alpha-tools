const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const { all } = require("./auth");

const { BadParams, DoesNotExist } = require("./middleware/CustomErrors");
const { default: yahooFinance } = require("yahoo-finance2");

const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
require("dotenv").config();

const MODE_DAY = "Day";
const MODE_WEEK = "Week";
const MODE_MONTH = "Month";
const BAD_PARAMS = "portfolio id is likely incorrect";
const DOES_NOT_EXIST = "portfolio doesn't exist";

// make new portfolio

router.post("/", async (req, res) => {
  const userId = req.session.userId;
  const { name, description } = req.body;
  const newPortfolio = await prisma.portfolio.create({
    data: {
      name,
      description,
      companiesIds: [],
      userId,
    },
  });
  res.json(newPortfolio);
});

router.get("/", async (req, res) => {
  const userId = req.session.userId;
  const allPortfolios = await prisma.portfolio.findMany({
    where: {
      userId,
    },
  });
  if (allPortfolios == null) {
    res.json([]);
  }
  res.status(200).json(allPortfolios);
});

router.delete("/:id", async (req, res, next) => {
  const portfolioId = parseInt(req.params.id);
  const portfolio = await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });
  if (portfolio == null) {
    next(new BadParams(BAD_PARAMS));
  }
  res.json(portfolio);
});

// delete company from portfolio
router.delete("/:id/:companyId", async (req, res, next) => {
  const portfolioId = parseInt(req.params.id);
  const companyId = parseInt(req.params.companyId);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });
  if (portfolio == null) {
    next(new DoesNotExist(BAD_PARAMS));
  }
  const array = portfolio.companiesIds.filter((val) => val !== companyId);
  const updatedPortfolio = await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      companiesIds: array,
    },
  });

  res.json(updatedPortfolio);
});

router.get("/:id", async (req, res, next) => {
  const portfolioId = parseInt(req.params.id);
  const userId = req.session.userId;
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });
  if (portfolio == null) {
    next(new DoesNotExist(DOES_NOT_EXIST));
  }
  if (userId !== portfolio.userId) {
    res
      .status(401)
      .json({ message: "you do not have permission to access this portfolio" });
  }
  res.json(portfolio);
});

// add company to portfolio

router.put("/add/:id/:companyId", async (req, res, next) => {
  const portfolioId = parseInt(req.params.id);
  const companyId = parseInt(req.params.companyId);

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (portfolio == null) {
    next(new BadParams("not a real portfolio id"));
  }

  if (portfolio.companiesIds.includes(companyId)) {
    next(new BadParams("id is already in portfolio"));
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

//add to multiple portfolio:

router.put("/addMany/:companyId", async (req, res, next) => {
  const companyId = parseInt(req.params.companyId);
  const possibleIds = req.body.ids;

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (possibleIds == null) {
    next(BadParams("no ids specified, or other bad param issue"));
  }
  const ids = possibleIds.map((val) => parseInt(val));

  for (let portfolioIds of ids) {
    if (portfolio.companiesIds.includes(companyId)) {
      continue;
    }
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        companiesIds: { push: companyId },
      },
    });
  }
  res.status(200).json({ message: "added" });
});

// x largest swings in portfolio, req period can be: "Day", "Week", "Month", "Year"
router.get("/swings/:portfolioId/:timeFrame", async (req, res, next) => {
  const timeFrame = req.params.timeFrame;
  let retArray = [];
  const portfolioId = parseInt(req.params.portfolioId);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });
  if (portfolio == null) {
    next(new BadParams("portfolio does not exist"));
  }
  // go through each company in the array, at the end sort by greatest change!
  const idArray = portfolio.companiesIds;
  for (let id of idArray) {
    company = await prisma.company.findUnique({
      where: {
        id,
      },
    });
    const todayString = new Date();
    const earlierString = getBeforeDate(timeFrame);
    const queryOptions = {
      period1: earlierString,
      period2: todayString,
      interval: "1d",
    };
    const result = await yahooFinance.historical(company.ticker, queryOptions);
    if (result) {
      firstVal = result[0];
      finalVal = result.pop();
      retArray.push({
        id: company.id,
        firstVal,
        finalVal,
        percentChange:
          ((finalVal.close - firstVal.close) / firstVal.close) * 100,
      });
    }
  }
  retArray.sort((a, b) => compareByPercentChange(a, b));
  res.json(retArray);
});

const getBeforeDate = (timeFrame) => {
  const today = new Date();
  let prevDate = new Date(today);
  if (timeFrame === MODE_DAY) {
    prevDate.setDate(prevDate.getDate() - 2);
  } else if (timeFrame === MODE_WEEK) {
    prevDate.setDate(prevDate.getDate() - 7);
  } else if (timeFrame === MODE_MONTH) {
    prevDate.setMonth(prevDate.getMonth() - 1);
  } else {
    prevDate.setFullYear(prevDate.getFullYear() - 1);
  }
  return prevDate;
};

const compareByPercentChange = (a, b) => {
  if (Math.abs(a.percentChange) > Math.abs(b.percentChange)) {
    return -1;
  } else {
    return 1;
  }
};

module.exports = router;

app.use((err, req, res, next) => {
  if (err instanceof BadParams || err instanceof DoesNotExist) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal Server Error" });
});
