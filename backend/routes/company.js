const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { BadParams } = require("./middleware/CustomErrors");

const express = require("express");
const router = express.Router({ mergeParams: true });

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
      include: {
        industry: {
          select: {
            name: true,
            sector: { select: { name: true } },
          },
        },
      },
    })
  );
});

module.exports = router;
