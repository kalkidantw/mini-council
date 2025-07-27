// auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;

// POST /signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("Users")
    .insert([{ email, passwordHash: hash }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign({ userId: data[0].id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user: data[0] });
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: userArray, error } = await supabase
    .from("Users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error || !userArray || userArray.length === 0) {
    return res.status(401).json({ error: "User not found" });
  }

  const user = userArray[0];
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user });
});

module.exports = router;
