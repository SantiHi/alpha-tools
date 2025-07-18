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
const tf = require("@tensorflow/tfjs-node");

const MODE_DAY = "Day";
const MODE_WEEK = "Week";
const MODE_MONTH = "Month";
const THREE_MONTH = "3Months";
const BAD_PARAMS = "portfolio id is likely incorrect";
const DOES_NOT_EXIST = "portfolio doesn't exist";
const PUBLIC_PORTFOLIOS_NUMBER = 6;
const NUM_FEATURES = 4;
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

/* Technical challenge #2, preformance prediction, using LSTM model and historical data on 
each stock to train and then predict the preformance each day for each company

This endpoint gets ALL earnings calls in the next month, and puts them in the db so that we have 
quick access for model. 
*/

router.get("/earnings/:id", async (req, res) => {
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
    async (error, data, response) => {
      res.json(data);
      for (let nextEarnings of data.earningsCalendar) {
        // check that symbol exists in db:
        const exists = await prisma.company.findUnique({
          where: {
            ticker: nextEarnings.symbol,
          },
        });
        if (exists == null) {
          continue;
        }
        await prisma.company.update({
          where: {
            ticker: nextEarnings.symbol,
          },
          data: {
            UpcomingEarnings: [
              nextEarnings.date,
              String(nextEarnings.epsActual),
              String(nextEarnings.epsEstimate),
              String(nextEarnings.revenueActual),
              String(nextEarnings.revenueEstimate),
              nextEarnings.symbol,
            ],
          },
        });
      }
    }
  );
});

/* create and run model! */
router.post("/model/:id", async (req, res) => {
  const FUTURE_DAYS = 30; // how many days we predict **these can be turned into params and specified by users later!"
  const WINDOW = 40; // how far in the past we look in total
  const portfolioId = parseInt(req.params.id);
  const currentCost = parseInt(req.body.currentPrice);
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });
  const companyArrays = await prisma.company.findMany({
    where: {
      id: {
        in: portfolio.companiesIds,
      },
    },
  });
  const tickerArr = companyArrays.map((val) => val.ticker);
  const todayString = new Date();
  const earlierString = getBeforeDate(THREE_MONTH);
  const historicalData = {};
  for (let tick of tickerArr) {
    const prices = await yahooFinance.chart(tick, {
      period1: formatDate(earlierString),
      period2: formatDate(todayString),
      interval: "1h",
    });
    historicalData[tick] = prices;
  }
  // clean data for model! we will add each of the values together and then get out
  // we will start by adding together each value and then later normalizing
  let cleanData = []; // earliest dates are earliest in the index!
  let dates = [];
  let labels = [];
  let highArr = [];
  let volArr = [];
  let openArr = [];
  let lowArr = [];
  let adjArr = [];
  for (let i = 0; i < historicalData[tickerArr[0]].quotes.length; i++) {
    let concatData = new Array(NUM_FEATURES).fill(0);
    let labelVal = 0;
    dates[i] = historicalData[tickerArr[0]].quotes[i].date; // dates should be the same everywhere
    for (let tick of tickerArr) {
      if (historicalData[tick].quotes[i] == null) {
        break;
      }
      // double for loops generally bad practice, but tickerArr is constant size (I doubt a portfolio will exceed 100 companies!)
      concatData[0] += historicalData[tick].quotes[i].high;
      concatData[1] += historicalData[tick].quotes[i].volume;
      concatData[2] += historicalData[tick].quotes[i].open;
      concatData[3] += historicalData[tick].quotes[i].low;
      labelVal += historicalData[tick].quotes[i].close;
    }
    cleanData.push(concatData);
    highArr.push(concatData[0]);
    volArr.push(concatData[1]);
    openArr.push(concatData[2]);
    lowArr.push(concatData[3]);
    adjArr.push(concatData[4]);
    labels.push(labelVal);
  }
  normalize(
    cleanData,
    [
      Math.min(...highArr),
      Math.min(...volArr),
      Math.min(...openArr),
      Math.min(...lowArr),
    ],
    [
      Math.max(...highArr),
      Math.max(...volArr),
      Math.max(...openArr),
      Math.max(...lowArr),
    ],
    true
  );
  let maxLabel = [Math.max(...labels)];
  let lastPrice = labels[labels.length - 1];
  let minLabel = [Math.min(...labels)];
  normalize(labels, minLabel, maxLabel, false);

  // data is now cleaned, so we create vectors for our model

  const X = []; // shape is ( #datapoints X WINDOW x NUM_FEATURES) - 80 past datapoints (can add more if needed), we have WINDOW inputs (past cost) and NUM_FEATURES features each (high, volume, open, low, adjclose)
  const Y = []; // this is size (1 x FUTURE_DAYS)
  for (let i = 0; i + WINDOW + FUTURE_DAYS <= cleanData.length; i++) {
    X.push(cleanData.slice(i, i + WINDOW));
    Y.push(labels.slice(i + WINDOW, i + WINDOW + FUTURE_DAYS));
  }
  const X_values = tf.tensor3d(X, [X.length, WINDOW, 4]);
  const Y_values = tf.tensor2d(Y, [Y.length, FUTURE_DAYS]);
  // model inspired by https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#8,
  // but heavily modified with own data and using lstm instead of only dense
  const model = tf.sequential();
  model.add(
    tf.layers.lstm({
      units: 50,
      inputShape: [WINDOW, NUM_FEATURES],
      returnSequences: false,
    })
  );
  model.add(tf.layers.dense({ units: FUTURE_DAYS, activation: "tanh" }));
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ["mse"], // val w mse validation / loss
  });
  await model.fit(X_values, Y_values, {
    epochs: 7,
    batchSize: 32,
    validationSplit: 0.2,
    verbose: 1,
  });

  const lastDays = cleanData.slice(-WINDOW);
  const input = tf.tensor3d([lastDays], [1, WINDOW, NUM_FEATURES]);
  const prediction = model.predict(input);
  const predictionArray = (await prediction.array())[0];
  let currentDate = new Date();
  let offset =
    currentCost -
    parseFloat(unNormalize(predictionArray[0], minLabel, maxLabel));
  const valuePredict = predictionArray.map((value) => {
    lastPrice = unNormalize(value, minLabel, maxLabel);
    currentDate.setDate(currentDate.getDate() + 1);
    return {
      date: formatDate(currentDate),
      price: parseFloat(lastPrice) + offset,
    };
  });
  tf.dispose([X_values, Y_values, input, prediction]);
  res.json(valuePredict);
});

// normalize data using xi - min(x) / (max(x) - min(x)) to get data with mean=0 and std 1,
// normalizes along columns
const normalize = (arrToNormalize, minvalues, maxvalues, double) => {
  if (double) {
    for (let i = 0; i < arrToNormalize.length; i++) {
      for (let k = 0; k < 4; k++) {
        arrToNormalize[i][k] =
          (arrToNormalize[i][k] - minvalues[k]) / (maxvalues[k] - minvalues[k]);
      }
    }
    return arrToNormalize;
  }
  for (let i = 0; i < arrToNormalize.length; i++) {
    arrToNormalize[i] =
      (arrToNormalize[i] - minvalues[0]) / (maxvalues[0] - minvalues[0]);
  }
  return arrToNormalize;
};

const unNormalize = (value, min, max) => {
  return value * (max - min) + min;
};

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
  } else if (timeFrame === THREE_MONTH) {
    prevDate.setMonth(prevDate.getMonth() - 3);
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
