const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
