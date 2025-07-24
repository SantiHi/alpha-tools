const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");

const { BadParams, DoesNotExist } = require("./middleware/CustomErrors");
const { default: yahooFinance } = require("yahoo-finance2");
const { formatDate, getBeforeDate } = require("../lib/utils");

const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
require("dotenv").config();

const finnhub = require("finnhub");
const finnhubClient = new finnhub.DefaultApi(process.env.finnhubKey);
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs-extra");
const B2 = require("backblaze-b2");
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
});

//constants
const bucketId = process.env.bucket_id; // buckedId for saving models
const THREE_MONTH = "3Months"; // string constant for getBeforeDate
const NUM_FEATURES = 4; // number of features in the model, currently (high, volume, open, low)

const cleanRawData = (historicalData, tickerArr) => {
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
  return { cleanData, labels, lastPrice: lastPrice, minLabel, maxLabel };
};

const saveModel = async (model, portfolioId) => {
  await b2.authorize(); // authorization last 24 hours!
  const uploadUrlResponse = await b2.getUploadUrl({
    bucketId: bucketId,
  });
  const tempDir = `./tmp/portfolio-${portfolioId}`;
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
  await model.save(`file://${tempDir}`);
  const remoteFilePath = `models/portfolio-${portfolioId}`;
  const endValues = ["model.json", "weights.bin"];
  for (let ending of endValues) {
    let data = fs.readFileSync(`${tempDir}/${ending}`);
    // store model json file
    await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: `${remoteFilePath}/${ending}`,
      data,
    });

    // remove old versions of the file from b2
    const response = await b2.listFileVersions({
      bucketId,
      prefix: `models/portfolio-${portfolioId}/${ending}`,
    });

    const fileVersions = response.data.files
      .filter((file) => file.fileName === `${remoteFilePath}/${ending}`)
      .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp); // sort the files by time uploaded.

    for (const deleteFile of fileVersions.slice(0, -1)) {
      await b2.deleteFileVersion({
        fileId: deleteFile.fileId,
        fileName: deleteFile.fileName,
      });
    }
  }
  fs.rmSync(tempDir, { recursive: true, force: true });
};

const getModel = async (portfolioId) => {
  const downloadUrl = (await b2.authorize()).data.downloadUrl; // authorization last 24 hours!
  const remoteFilePath = `models/portfolio-${portfolioId}`;
  const response = await b2.getDownloadAuthorization({
    bucketId,
    fileNamePrefix: remoteFilePath,
    validDurationInSeconds: 3600,
  });
  const authorizationToken = response.data.authorizationToken;
  const url = `${downloadUrl}/file/${process.env.bucket_name}/${remoteFilePath}/model.json?Authorization=${authorizationToken}`;
  return tf.loadLayersModel(url);
};

const getCachedIfExists = async (portfolioId) => {
  try {
    const model = await getModel(portfolioId);
    return model;
  } catch (err) {
    return null;
  }
};

/* create and run model! */
router.post("/:id", async (req, res) => {
  const FUTURE_DAYS = 30; // how many days we predict **these can be turned into params and specified by users later!"
  const WINDOW = 40; // how far in the past we look in total
  const portfolioId = parseInt(req.params.id);
  const currentCost = parseInt(req.body.currentPrice);
  const isNewModel = JSON.parse(req.body.newModel);
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
  let { cleanData, labels, lastPrice, minLabel, maxLabel } = cleanRawData(
    historicalData,
    tickerArr
  );
  let lastDays = cleanData.slice(-WINDOW);
  let model = await getCachedIfExists(portfolioId);
  if (model == null || isNewModel == true) {
    // data is now cleaned, so we create vectors for our model\
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
    model = tf.sequential();
    model.add(
      tf.layers.lstm({
        units: 30,
        inputShape: [WINDOW, NUM_FEATURES],
        returnSequences: true,
      })
    );
    model.add(
      tf.layers.lstm({
        units: 16,
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
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 1,
    });
    await saveModel(model, portfolioId);
    tf.dispose([X_values, Y_values]);
  }
  lastDays = cleanData.slice(-WINDOW);
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
  tf.dispose([input, prediction]);
  const finalValues = await additionalModelFactors(
    tickerArr,
    valuePredict,
    companyArrays
  );
  // we have base predictions, now we add in other factors, like P/E, earnings expectations, etc.
  res.json(finalValues);
});

// now we look at P/E, earnings expectations, etc:

// to do this, we look at average analyst rating and give higher weight to those
const additionalModelFactors = async (tickers, valuePredict, companyArrays) => {
  const data = await yahooFinance.quote(tickers, { validateResult: false });
  let getEarnings = companyArrays.map((value) => value.UpcomingEarnings); // when are the next earnings calls?
  getEarnings = getEarnings.filter((value) => value.length != 0);
  let analystsum = 0;
  for (let companydata of data) {
    if (companydata.averageAnalystRating == null) {
      analystsum += 2.5;
    } else {
      const newFloat = parseFloat(
        companydata.averageAnalystRating.split(" ")[0]
      );
      analystsum += newFloat;
    }
  }
  const averageAnalystRating = analystsum / parseFloat(data.length); // analyst rating goes from 1-5. Add to predictions based on this!, up to 10% swing at the end.
  // we choose 1.003 as constant for 1.0 as a 10% (30 day timeframe) total increase for having a perfect analyst rating, or a rating of 1 (ie -- 1.003^30 = 1.09 )
  // likewise we choose 0.997 as a constant for 5.0, for a total 10% DECREASE (30 day timeframe )for having a horrible analyst rating of 5. Everything else is evenly between!

  // get insider trading transactions as well!
  const dateNow = formatDate(new Date());
  let prevDate = new Date(dateNow);
  prevDate.setFullYear(prevDate.getFullYear() - 1);
  let factorChange = determineFactor(averageAnalystRating);
  let sentimentCost = 0;
  for (let tick of tickers) {
    finnhubClient.insiderSentiment(
      tick,
      formatDate(prevDate),
      dateNow,
      async (error, data) => {
        if (error) {
          console.error(error);
          return;
        }
        if (data.data[data.data.length - 1]) {
          sentimentCost += data.data[data.data.length - 1].mspr;
        }
      }
    );
  }
  factorChange += Math.sign(sentimentCost) * 0.0005;
  const newPredict = valuePredict.map((value, ind) => {
    const factor = Math.pow(factorChange, ind);
    return { date: value.date, price: value.price * factor };
  });

  return newPredict;
};

const determineFactor = (averageAnalystRating) => {
  const factorRange = 0.008;
  const dilution = (3 - (averageAnalystRating + 0.5)) / 4; // subtracting .5 factor as the analyst ratings are always skewed towards buy.
  return 1 + factorRange * dilution;
};

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

/* Technical challenge #2, performance prediction, using LSTM model and historical data on 
each stock to train and then predict the performance each day for each company

This endpoint gets ALL earnings calls in the next month, and puts them in the db so that we have 
quick access for model. 
*/

router.get("/earnings", async (req, res) => {
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

module.exports = router;
