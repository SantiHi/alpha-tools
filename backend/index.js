const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());
const session = require("express-session");
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { secure: false, maxAge: 15 * 60 * 1000 },
  })
);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
