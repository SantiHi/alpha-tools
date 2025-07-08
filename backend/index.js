const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const { BadParams, DoesNotExist } = require("./routes/middleware/CustomErrors");

const express = require("express");
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const ORIGIN = process.env.origin;
const cors = require("cors");
const app = express();
app.use(express.json());
const session = require("express-session");
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { secure: false, maxAge: 15 * 60 * 1000 }, // 15 minutes!!
  })
);

app.use((req, res, next) => {
  const userId = req.session.userId;
  const path = req.path;
  if (path.includes("/login") || path.includes("/signup")) {
    next();
    return;
  }
  if (userId == null) {
    return res.status(401).json({ message: "you are not logged in" });
  }
  next();
});

const authRoutes = require("./routes/auth");
const getterRoutes = require("./routes/getters");
const populatorRoutes = require("./populators/tickers");
const portfolioRoutes = require("./routes/portfolios");
const companyRoutes = require("./routes/company");
app.use("/getters", getterRoutes);
app.use("/auth", authRoutes);
app.use("/populators", populatorRoutes);
app.use("/portfolios", portfolioRoutes);
app.use("/company", companyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
