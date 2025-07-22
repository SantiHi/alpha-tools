const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { BadParams } = require("./middleware/CustomErrors");

const express = require("express");
const router = express.Router({ mergeParams: true });

// constants
const INDUSTRY_REWARD = 1;
const SECTOR_REWARD = 0.5;
const LAMBDA = 0.1;
// getting companies by multiple ids
router.post("/", async (req, res, next) => {
  const possibleIds = req.body.ids;
  if (possibleIds == null) {
    next(new BadParams("no ids specified, or other bad param issue"));
  }
  const ids = req.body.ids.map((val) => parseInt(val));
  res.json(
    await prisma.company.findMany({
      where: {
        id: { in: ids },
      },
    })
  );
});

const LOWER_THAN_CHANGE = 0.05;
const INIT_IND_REWARD = 0.2;
const INIT_SECT_REWARD = 0.1;

// user has seen company so we add to search_history. if already in search history,
// it returns to the beginning of the array. Also updated all weight vectors accordingly
router.put("/companyhist/:companyId", async (req, res) => {
  const id = parseInt(req.params.companyId);
  const userId = req.session.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let history = user.search_history;
  history = history.filter((currentid) => parseInt(currentid) !== parseInt(id));
  history.unshift(parseInt(id));
  const company = await prisma.company.findUnique({
    where: {
      id,
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
  let newIndWeights = user.industryWeights;
  if (newIndWeights[company.industryId] == 0) {
    newIndWeights[company.industryId] = INIT_IND_REWARD;
  } else {
    newIndWeights[company.industryId] =
      newIndWeights[company.industryId] +
      Math.pow(LAMBDA, newIndWeights[company.industryId]) * INDUSTRY_REWARD;
  }
  let newSectorWeights = user.sectorWeights;
  if (newIndWeights[company.industry.sector.id] == 0) {
    newIndWeights[company.industry.sector.id] = INIT_SECT_REWARD;
  } else {
    newIndWeights[company.industryId] =
      newIndWeights[company.industryId] +
      Math.pow(LAMBDA, newIndWeights[company.industryId]) * INDUSTRY_REWARD;
  }
  // all other sectors who weren't clicked on get lowered, proportional to how large their weights are (we want larger weights to go down faster! )
  newIndWeights = newIndWeights.map((value, ind) => {
    if (ind === company.industryId || value <= LOWER_THAN_CHANGE) {
      return value;
    } else {
      return value - Math.pow(LAMBDA, 1.5) * value;
    }
  });
  newSectorWeights = newSectorWeights.map((value, ind) => {
    if (ind === company.industry.sector.id || value <= LOWER_THAN_CHANGE) {
      return value;
    } else {
      return value - Math.pow(LAMBDA, 1.5) * value;
    }
  });
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      search_history: history,
      sectorWeights: newSectorWeights,
      industryWeights: newIndWeights,
    },
  });
  res.json({ message: `history updated with id ${id}` });
});
// user has now seen company, so we remove any instance of it and put it back to the front of the array!
router.post("/:id", async (req, res, next) => {
  const companyId = req.body.id;
});

module.exports = router;
