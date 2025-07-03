const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const ORIGIN = process.env.origin;
const cors = require("cors");
const app = express();
app.use(express.json());
const session = require("express-session");
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { secure: false, maxAge: 15 * 60 * 1000 }, // 15 minutes!!
  })
);

const authRoutes = require("./routes/auth");

const getterRoutes = require("./routes/getters");
app.use("/getters", getterRoutes);

app.use("/auth", authRoutes);

const populatorRoutes = require("./populators/tickers");
app.use("/populators", populatorRoutes);

const portfolioRoutes = require("./routes/portfolios");
app.use("/portfolios", portfolioRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
