const { MIN_PASSWORD_LENGTH } = require("../../frontend/src/lib/constants");

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
const argon2 = require("argon2");
const rateLimit = require("express-rate-limit");

// constants
CONST_LOCKEDOUT_TIME = 10;
// Simplistic Signup Route

router.update("/:companyId", async (req, res) => {
  companyId = parseInt(req.params.companyId);
  prisma.company.update({
    where: { id: portfolioId },
    data: {
      companiesIds: array,
    },
  });
});
