const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { default: yahooFinance } = require("yahoo-finance2");

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// constants for getBefore Date
const MODE_DAY = "Day";
const MODE_WEEK = "Week";
const MODE_MONTH = "Month";
const THREE_MONTH = "3Months";

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

const BATCH_SIZE = 100;
const MAX_BETWEEN_TIME_PRICE = 1000 * 60 * 90; // 1.5 hr update cycle, don't want to get ip banned from yfinance -> no batch call for yfinance js unfortunately

//used mostly for recommendations
const updateAllCompanies = async () => {
  const mostRecent = await prisma.company.findFirst({
    orderBy: {
      lastUpdate: "desc",
    },
  });
  const currentTime = new Date();
  if (
    Math.abs(mostRecent.lastUpdate.getTime() - currentTime.getTime()) <
    MAX_BETWEEN_TIME_PRICE
  ) {
    return;
  }
  const allCompanies = await prisma.company.findMany();
  const onlyTickers = allCompanies.map((value) => value.ticker);
  let currentInd = 0;
  while (true) {
    // to prevent yfinance crash
    batchSplit = onlyTickers.slice(currentInd, currentInd + BATCH_SIZE);
    if (batchSplit.length == 0) {
      break;
    }
    const prices = await yahooFinance.quote(
      batchSplit,
      { modules: ["price"] },
      { validateResult: false }
    );
    const firstDate = formatDate(getBeforeDate(""));
    const secondDate = formatDate(new Date());
    const options = {
      period1: firstDate,
      period2: secondDate,
      events: "dividends",
    };
    const dividends = [];
    for (let ticker of batchSplit) {
      await wait(350);
      try {
        const rep = (await yahooFinance.chart(ticker, options)).events
          .dividends;
        dividends.push(rep);
      } catch (err) {
        dividends.push(null);
      }
    }
    currentInd += BATCH_SIZE;
    for (let i = 0; i < prices.length; i++) {
      const company = prices[i];
      if (dividends[i] == null) {
        await prisma.company.update({
          where: {
            ticker: company.symbol,
          },
          data: {
            daily_price: company.regularMarketPrice,
            daily_price_change: company.regularMarketChangePercent,
            lastUpdate: new Date(),
          },
        });
      } else {
        const dividendsDateList = dividends[i].map((val) => val.date);
        const dividendsAmountList = dividends[i].map((val) => val.amount);
        await prisma.company.update({
          where: {
            ticker: company.symbol,
          },
          data: {
            daily_price: company.regularMarketPrice,
            daily_price_change: company.regularMarketChangePercent,
            lastUpdate: new Date(),
            dividends: dividendsAmountList,
            dividendsDates: dividendsDateList,
          },
        });
      }
    }
  }
};

module.exports = { formatDate, getBeforeDate, updateAllCompanies, wait };
