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
const finnhub = require("finnhub");
const finnhubClient = new finnhub.DefaultApi(process.env.finnhubKey);

const MODE_DAY = "Day";
const MODE_WEEK = "Week";
const MODE_MONTH = "Month";
const BAD_PARAMS = "portfolio id is likely incorrect";
const DOES_NOT_EXIST = "portfolio doesn't exist";
const PUBLIC_PORTFOLIOS_NUMBER = 6;

// make new portfolio
router.post("/", async (req, res) => {
  const userId = req.session.userId;
  const { name, description, isPublic } = req.body;
  const publicStatus = JSON.parse(isPublic);
  const newPortfolio = await prisma.portfolio.create({
    data: {
      name,
      description,
      companiesIds: [],
      userId,
      isPublic: publicStatus,
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
  if (userId !== portfolio.userId && portfolio.isPublic !== true) {
    res
      .status(401)
      .json({ message: "you do not have permission to access this portfolio" });
  }
  res.json(portfolio);
});

// add company to portfolio -

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

  if (companyId == null) {
    next(BadParams("companyids specified, or other bad param issue"));
  }

  const ids = possibleIds.map((val) => parseInt(val));

  for (let portfolioId of ids) {
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: portfolioId,
      },
    });
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

/* get all public portfolios, sort by top X_number - get best recommended by preformance 
your interest, here preformance will be weighted more than before! 
*/

const PREFORMANCE_CONST = 0.6;
router.get("/curated/public", async (req, res) => {
  const userId = req.session.userId;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const allPortfolios = await prisma.portfolio.findMany({
    where: {
      isPublic: true,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  // get companies that are in the portfolios and then score them similar to
  portfolioScores = {};
  for (let portfolio of allPortfolios) {
    const portfolioCompanies = await prisma.company.findMany({
      where: {
        id: {
          in: portfolio.companiesIds,
        },
      },
      include: {
        industry: {
          select: {
            id: true,
            sector: { select: { id: true } },
          },
        },
      },
    });
    let portfolioSum = 0;
    portfolioCompanies.map((value) => {
      portfolioSum += scoreValue(value, user, PREFORMANCE_CONST);
      return scoreValue(value, user, PREFORMANCE_CONST);
    });
    // give slight preference to larger portfolios --- ie, dont want recommendation to be all 1 company portfolios
    portfolioScores[portfolio.id] =
      portfolioSum / (portfolioCompanies.length - 1);
  }
  const recommendedPortfolios = allPortfolios
    .sort((a, b) => portfolioScores[b.id] - portfolioScores[a.id])
    .slice(0, PUBLIC_PORTFOLIOS_NUMBER);
  res.json(recommendedPortfolios);
});

// return scoresDictionary.
const scoreValue = (company, user, preformaceFactor) => {
  let totalCompanyWeight = 0;
  totalCompanyWeight += user.industryWeights[company.industryId];
  totalCompanyWeight += user.sectorWeights[company.industry.sector.id];
  totalCompanyWeight += preformaceFactor * company.daily_price_change;
  // search history incorporation doesnt make sense for a portfolio search, so not factored in here.
  return totalCompanyWeight;
};

// make public / private a portfolio:
router.post("/make/public/:id", async (req, res) => {
  const portfolioId = parseInt(req.params.id);

  const currentPort = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  allPortfolios = await prisma.portfolio.update({
    where: {
      id: portfolioId,
    },
    data: {
      isPublic: !currentPort.isPublic,
    },
  });
  res.json(allPortfolios);
});

// figure out what should be shown to the user!

router.get("/permissions/user/:id", async (req, res) => {
  const portfolioid = parseInt(req.params.id);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioid,
    },
  });
  if (req.session.userId === portfolio.userId) {
    res.json({ owner: true, public: portfolio.isPublic });
    return;
  }
  res.json({ owner: false, public: portfolio.isPublic });
});

// Technical challenge #2, preformance prediction
/* 

returns two things, stock data in form 
  [{date: XX, price: price}, ..., ..] 

and also risk indicators in the next month of form 
  [{data: XX, company: XX, risk XX}]
  ex of risks: earnings release, 
*/

router.get("/portfolio/prediction/:id", async (req, res) => {
  const portfolioid = parseInt(req.params.id);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioid,
    },
  });

  const today = new Date();
  let nextDate = new Date(today);
  nextDate.setMonth(nextDate.getMonth() + 1);
  const begin = formatDate(today);
  const end = formatDate(nextDate);
  finnhubClient.earningsCalendar(
    { from: begin, to: end },
    (error, data, response) => {
      res.json(data);
    }
  );
});

const formatDate = (dateObj) => {
  const formattedDate = `${dateObj.getFullYear()}-${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  return formattedDate;
};
//helper functions below

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
