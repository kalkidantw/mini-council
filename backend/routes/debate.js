const express = require("express");
const router = express.Router();
const { generatePersonaDebate } = require("../services/debateEngine");
const { generateTTSForMessages } = require("../services/ttsService");
const { printTokenSummary } = require("../personas");
const { createClient } = require("@supabase/supabase-js");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/debate/:id/respond
router.post("/:id/respond", async (req, res) => {
  try {
    const { id: dilemmaId } = req.params;
    const { volumeLevels } = req.body; // Extract volume levels from request body
    
    // Add logging for debugging
    console.log(`Looking for dilemma with ID: ${dilemmaId}`);
    console.log(`Request body:`, req.body);
    console.log(`Volume levels:`, volumeLevels);

    // 1. Fetch dilemma from Supabase with better error handling
    const { data: dilemmaDataArray, error } = await supabase
      .from("Dilemmas")
      .select("prompt, id")
      .eq("id", dilemmaId.toString())
      .limit(1);

    // Log the query results
    console.log('Supabase query result:', { data: dilemmaDataArray, error });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: "Database error", 
        details: error.message,
        searchedId: dilemmaId 
      });
    }

    // Handle the array response
    const dilemmaData = dilemmaDataArray?.[0];
    
    if (!dilemmaData) {
      return res.status(404).json({ 
        error: "Dilemma not found",
        searchedId: dilemmaId 
      });
    }

    console.log('Found dilemma:', dilemmaData);

    const prompt = dilemmaData.prompt;
    
    // 2. Generate the multi-turn debate with volume levels
    console.log('🎭 Generating volume-controlled multi-turn debate...');
    const debateResult = await generatePersonaDebate(prompt, volumeLevels);
    
    console.log(`✅ Generated debate with ${debateResult.messages.length} messages`);
    console.log(`📊 Total debate duration: ${debateResult.messages[debateResult.messages.length - 1]?.timestamp || 0} seconds`);

    // 3. Generate TTS audio for all messages
    console.log('🎤 Generating TTS audio for all messages...');
    const messagesWithTTS = await generateTTSForMessages(debateResult.messages);
    console.log(`✅ TTS generation completed for ${messagesWithTTS.length} messages`);

    // Convert audio buffers to base64 for frontend consumption
    const messagesWithAudioData = messagesWithTTS.map(msg => ({
      persona: msg.persona,
      message: msg.message,
      timestamp: msg.timestamp,
      audioData: msg.audioBuffer ? msg.audioBuffer.toString('base64') : null
    }));

    // 4. Save debate messages to Responses table
    const savedMessages = [];
    for (const message of debateResult.messages) {
      try {
        const { data: responseData, error: insertError } = await supabase
          .from("Responses")
          .insert([
            {
              dilemma_id: dilemmaId,
              persona: message.persona,
              transcript: message.message,
              timestamp: new Date().toISOString(),
              debate_timestamp: message.timestamp, // Store the debate timestamp
            },
          ])
          .select();

        if (insertError) {
          console.error(`Error saving ${message.persona} message:`, insertError);
        } else {
          console.log(`✅ Saved ${message.persona} message at ${message.timestamp}s`);
          savedMessages.push(responseData[0]);
        }
      } catch (saveError) {
        console.error(`Error saving debate message:`, saveError);
      }
    }

    // Print token usage summary
    printTokenSummary();

    res.json({ 
      success: true, 
      debate: {
        messages: messagesWithAudioData,
        conclusions: debateResult.conclusions,
        totalDuration: debateResult.messages[debateResult.messages.length - 1]?.timestamp || 0
      },
      dilemmaId: dilemmaId,
      dilemmaPrompt: prompt,
      savedMessages: savedMessages.length
    });

  } catch (error) {
    console.error('Unexpected error in debate respond:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
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
