const { MIN_PASSWORD_LENGTH } = require("../../frontend/src/utils/constants");

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

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
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

  if (existingUser != null) {
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

// login routes!

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 10 login attempts per windowMs
  message: { error: "Too many failed login attempts. Try again in 10 minutes" },
});

router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password." });
  }

  const isValidPassword = await argon2.verify(user.password, password);
  if (!isValidPassword) {
    return res.status(400).json({ error: "Invalid username or password." });
  }
  req.session.userId = user.id;
  console.log("success");
  res.status(200).json({ message: "Login successful!" });
});

// check if valid session exists!
router.get("/me", async (req, res) => {
  const userId = req.session.userId;
  if (userId == null) {
    return res.status(401).json({ message: "Not logged in" });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true }, // Only return necessary data
  });

  res.json({ id: req.session.userId, username: user.username });
});

module.exports = router;
