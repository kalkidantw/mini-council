const express = require("express");
const router = express.Router();
const { generatePersonaDebate } = require("../services/debateEngine");
const { printTokenSummary } = require("../personas");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/debate/:id/respond
router.post("/:id/respond", async (req, res) => {
  try {
    const dilemmaId = req.params.id;
    const { volumeLevels } = req.body;
    // 1. Fetch dilemma prompt
    const { data: dilemmaData, error: dilemmaError } = await supabase
      .from("Dilemmas")
      .select("prompt")
      .eq("id", dilemmaId)
      .single();
    if (dilemmaError || !dilemmaData) {
      return res.status(404).json({ error: "Dilemma not found" });
    }
    const prompt = dilemmaData.prompt;
    // 2. Generate the multi-turn debate (text only)
    const debateResult = await generatePersonaDebate(prompt, volumeLevels);
    const messages = debateResult.messages;
    // 3. Return transcript and message metadata immediately (no audio)
    res.json({
      success: true,
      debate: {
        messages: messages.map((msg) => ({
          persona: msg.persona,
          message: msg.message,
          timestamp: msg.timestamp,
          audioData: msg.audioData,
          ttsMs: msg.ttsMs,
        })),
        conclusions: debateResult.conclusions,
        totalDuration: messages.length * 2, // Fixed 2s per message
      },
      dilemmaId,
      dilemmaPrompt: prompt
    });
  } catch (error) {
    console.error('Unexpected error in debate respond:', error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Test endpoint to check OpenAI connectivity
router.get("/test-openai", async (req, res) => {
  try {
    console.log("🧪 Testing OpenAI connectivity...");
    
    const testCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, OpenAI is working!'"
        }
      ],
      max_tokens: 10,
    });

    const response = testCompletion.choices[0].message.content;
    console.log("✅ OpenAI test successful:", response);
    
    res.json({ 
      success: true, 
      message: "OpenAI is working",
      response: response
    });
    
  } catch (error) {
    console.error("❌ OpenAI test failed:", error);
    res.status(500).json({ 
      error: "OpenAI test failed", 
      details: error.message 
    });
  }
});

module.exports = router;
