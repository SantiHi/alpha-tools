const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { BadParams } = require("./middleware/CustomErrors");

const express = require("express");
const router = express.Router({ mergeParams: true });

// constants
CONST_LOCKEDOUT_TIME = 10;
CONST_INDUSTRY_REWARD = 1;
CONST_SECTOR_REWARD = 0.5;
CONST_LAMBDA = 0.1;
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

// user has seen company so we add to search_history. if already in search history,
// it returns to the beginning of the array.
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
  const newIndWeights = user.industryWeights;
  newIndWeights[company.industryId] =
    newIndWeights[company.industryId] + CONST_LAMBDA * CONST_INDUSTRY_REWARD;
  const newSectorWeights = user.sectorWeights;
  newSectorWeights[company.industry.sector.id] =
    newSectorWeights[company.industry.sector.id] +
    CONST_LAMBDA * CONST_SECTOR_REWARD;
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
