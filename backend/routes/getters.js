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

/* initially, a linear suggestions algorithim with weighting on the following categories: 
    w1*IndustryPreference 
    w2*SectorPreference 
    w3*recencyScore*numberOfVisits 
    w4*IndustryInterest (recent visits to that industry)
    w5*SectorInterest (recent visits to hat sector)

    will add more complicated logic in later iterations, likely change to learned model .
*/

// weightings can be at most 1, least 0
const INDUSTRY_WEIGHTING = 1; // industries are more specific, so should be of higher importance
const SECTOR_WEIGHTING = 0.5; // less so, so less important

router.get("/curated", async (req, res) => {
  const userId = req.session.userId;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  console.log(user.name);
  const interestedIndustries = user.industries;
  const interestedSectors = user.Sectors;
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

    if (interestedIndustries.includes(company.industryId)) {
      totalCompanyWeight += INDUSTRY_WEIGHTING;
    }
    if (interestedSectors.includes(company.industry.sectorId)) {
      totalCompanyWeight += SECTOR_WEIGHTING;
    }
    scoresDictionary[company.id] = totalCompanyWeight;
  }

  const bestCompanies = allCompanies
    .sort((a, b) => scoresDictionary[b.id] - scoresDictionary[a.id])
    .slice(0, 8);

  console.log(bestCompanies);
  res.json(bestCompanies);
});

router.get("/explore", async (req, res) => {
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
