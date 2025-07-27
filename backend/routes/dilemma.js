// backend/routes/dilemma.js
const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/dilemma - Create a new dilemma
router.post("/", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // No auth logic, no user_id
  const { data, error } = await supabase
    .from("Dilemmas")
    .insert([{ prompt }])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Failed to save dilemma" });
  }

  res.status(200).json({ message: "Dilemma saved!", dilemma: data });
});

// GET /api/dilemma/:id - Get a dilemma by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Dilemma ID is required" });
  }

  const { data: dilemmaArray, error } = await supabase
    .from("Dilemmas")
    .select("id, prompt")
    .eq("id", id.toString())
    .limit(1);

  if (error) {
    console.error("Supabase query error:", error);
    return res.status(500).json({ error: "Database error" });
  }

  const dilemma = dilemmaArray?.[0];
  
  if (!dilemma) {
    return res.status(404).json({ error: "Dilemma not found" });
  }

  res.status(200).json({ dilemma });
});

module.exports = router;
