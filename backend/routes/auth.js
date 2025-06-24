const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router({ mergeParams: true });
const argon2 = require("argon2");

// Simplistic Signup Route
router.post("/signup", async (req, res) => {
  const { username, password, email, name } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long." });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username,
        },
        {
          email,
        },
      ],
    },
  });

  if (existingUser) {
    return res.status(400).json({ error: "Username or email already used." });
  }
  const hashedPassword = await argon2.hash(password);

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
      name,
    },
  });

  res.status(201).json(newUser);
});

module.exports = router;
// Simplistic login Route
