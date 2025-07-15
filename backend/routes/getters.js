const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
const yahooFinance = require("yahoo-finance2").default;
require("dotenv").config();

const { FinlightApi } = require("finlight-client");
const newsApiToken = process.env.news;
const client = new FinlightApi({ apiKey: newsApiToken });
const { updateAllCompanies } = require("../populators/tickers");

CONST_DISCOUNT_FACTOR = 0.85;
CONST_NUMBER_RECOMMENDED = 8;

router.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  const searchResults = await prisma.company.findMany({
    where: {
      OR: [
        {
          name: { contains: query, mode: "insensitive" },
        },
        {
          ticker: { contains: query, mode: "insensitive" },
        },
      ],
    },
    orderBy: { id: "asc" },
    take: 3,
  });
  res.json(searchResults);
});

router.get("/checker/:companyTick", async (req, res) => {
  const ticker = req.params.companyTick;
  const companyInfo = await prisma.company.findFirst({
    where: {
      ticker,
    },
  });
  res.json(companyInfo);
});

// get yahoo finance data on a stock
router.get("/stats/:companyTick", async (req, res) => {
  const ticker = req.params.companyTick;
  const result = await yahooFinance.quote(ticker);
  if (result === null) {
    res.status(404).json({ message: "ticker does not exist" });
  }
  res.status(200).json(result);
});

const CHANGE_WEIGHT = 0.25; // how much weight is given to well preforming stocks?

// specific algorithim for reccomendations list

/* 
Algorithim as Stands:
  New User:
      - User Inputs Interest, Weight array initialized for both Sectors and Industries. 
 
  Iteration:

    User Interaction: - code located at /companyhist/:companyId endpoint in company.js 

      -  On user interaction with app, each time user clicks on a profile, 
      that companies' sector / industry have weight's increased slightly. 
      - The user also has that company brought to the front of their search history, increasing 
      it's likelyhood of being recommended UNLESS that company is in a portfolio in which 
      its's likelyhodd is decreased (score is lowered). 
      -  *note*, company search history matters less as time goes on. the most recent company gets 
      .85 "points" to its score, next .85^2, next .85^3, etc. 

  Other Factors: 

      - Stocks preforming better (based on percentage) are also given additional score depending on 
      how well they are preforming. However, it is costly to get realtime data each time the explore 
      page is queried, so instead this percentage is only updated every 20 minutes. -- see post populators/ for details. 

  Score Detail: 
    - Companies are each given a utility score based on the above criteria and top eight per user are recommended. 

  TODO in later iterations: 
  - give additional attention to companies with high page interaction "clicks" of the entire userbase 
  - cap weights of industries / sectors so they do not grow out of control. additionally, lower the scores 
    of non-clicked on industries / sectors! 
*/

router.get("/curated", async (req, res) => {
  updateAllCompanies();
  const userId = req.session.userId;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const allCompanies = await prisma.company.findMany({
    include: {
      industry: {
        select: {
          id: true,
          sector: { select: { id: true } },
        },
      },
    },
  });

  const validCompanies = allCompanies.filter(
    (c) => c.industryId !== null && c.industry !== null
  );
  const scoresDictionary = {};
  for (let company of validCompanies) {
    let totalCompanyWeight = 0;
    totalCompanyWeight += user.industryWeights[company.industryId];
    totalCompanyWeight += user.sectorWeights[company.industry.sector.id];
    totalCompanyWeight += CHANGE_WEIGHT * company.daily_price_change;

    if (user.search_history.includes(company.id)) {
      const indexOf = user.search_history.indexOf(company.id);
      totalCompanyWeight += Math.pow(CONST_DISCOUNT_FACTOR, indexOf);
    }

    scoresDictionary[company.id] = totalCompanyWeight;
  }

  const bestCompanies = validCompanies
    .sort((a, b) => scoresDictionary[b.id] - scoresDictionary[a.id])
    .slice(0, CONST_NUMBER_RECOMMENDED);
  res.json(bestCompanies);
});

router.get("/explore", async (req, res) => {
  res.json(
    await prisma.company.findMany({
      orderBy: {
        created_at: "asc",
      },
      take: CONST_NUMBER_RECOMMENDED,
    })
  );
});

// getting companies by ID!
router.get("/companyById/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  res.json(
    await prisma.company.findUnique({
      where: {
        id,
      },
    })
  );
});

// get company documents ID!
router.get("/documents/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  res.json(
    await prisma.document.findMany({
      where: {
        companyId: id,
      },
      orderBy: {
        filed_date: "desc",
      },
    })
  );
});

// get company news data!
router.get("/news/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const company = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (company == null) {
    res.status(404).json({
      message: "company is not in database / is not pubically traded",
    });
  }
  const companyName = company.name;

  let currentArticles = await prisma.article.findMany({
    where: { companyId: id },
    orderBy: { created_at: "desc" },
  });
  if (currentArticles.length !== 0) {
    if (currentArticles[0].created_at - Date.now() < 18000000) {
      // 5 hour update cycle
      res.status(200).json(currentArticles);
      return;
    }
  }
  // we have not updated news articles in over 5 hours ( I only get 166 api calls a day, so we cache results)
  const response = await client.articles.getBasicArticles({
    query: companyName,
  });
  for (let article of response.articles) {
    await prisma.article.upsert({
      // upsert to avoid repeated articles on updates
      where: {
        link: article.link,
      },
      update: {},
      create: {
        link: article.link,
        source: article.source,
        title: article.title,
        summary: article.summary,
        publishDate: new Date(article.publishDate),
        language: article.language,
        images: article.images,
        companyId: company.id,
      },
    });
  }

  currentArticles = await prisma.article.findMany({
    where: { companyId: id },
    orderBy: { created_at: "desc" },
  });

  res.status(200).json(currentArticles);
});

module.exports = router;
