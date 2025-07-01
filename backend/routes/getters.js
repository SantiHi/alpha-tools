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

// get yahoo finance data on a stock
router.get("/stats/:companyTick", async (req, res) => {
  const ticker = req.params.companyTick;
  const result = await yahooFinance.quote(ticker);
  if (result === null) {
    res.status(404).json({ message: "ticker does not exist" });
  }
  res.status(200).json(result);
});

// explore page, will be filled with better suggestions later
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
    res
      .status(404)
      .json({ message: "company is not in databse / is not pubically traded" });
  }
  const companyName = company.name;

  const currentArticles = await prisma.article.findMany({
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
  res.status(200).json(response);
});

module.exports = router;
