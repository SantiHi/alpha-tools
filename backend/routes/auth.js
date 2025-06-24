const express = require("express");
app.use(express.json());
const app = express();
app.use(express.json());
router = express.Router();
const argon2 = require("argon2");

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
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

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return res.status(400).json({ error: "Username already taken." });
  }
  const hashedPassword = await argon2.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      password,
    },
  });

  res.status(201).json({ message: `user ${username} created!` });
});
