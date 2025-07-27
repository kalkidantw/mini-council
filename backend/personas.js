const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const OpenAI = require("openai");
const { tokenTracker } = require("./token-tracker");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch
});

const systemPrompts = {
  Heart: "You speak with pure empathy, emotion, and instinct. Be emotionally intelligent, kind, and passionate.",
  Logic: "You speak with facts, analysis, and rational deduction. Be objective, reasoned, and efficient.",
  Shadow: "You speak from fear, doubt, and self-interest. Be skeptical, darkly honest, and self-protective.",
};

async function generatePersonaResponse(persona, prompt, history = []) {
  const modelName = "gpt-4o-mini";
  console.log(`🤖 Using OpenAI model: ${modelName} for persona: ${persona}`);
  
  // Build the conversation messages
  const messages = [
    {
      role: "system",
      content: systemPrompts[persona]
    }
  ];

  // Add conversation history if provided
  if (history && history.length > 0) {
    history.forEach(entry => {
      messages.push({
        role: "user",
        content: `${entry.speaker}: ${entry.message}`
      });
    });
  }

  // Add the current dilemma prompt
  messages.push({
    role: "user",
    content: `User's dilemma: ${prompt}`
  });

  console.log(`📝 Generating response for ${persona} with ${messages.length} messages`);

  try {
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: messages,
      max_tokens: 250, // token budget limit - keeps responses short and cost-effective
      temperature: 0.8,
    });

    const responseText = completion.choices[0].message.content;
    
    // Track token usage for budget management
    tokenTracker.trackUsage(persona, completion.usage);
    
    console.log(`✅ Successfully generated ${persona} response (${responseText.length} characters)`);
    return responseText;
  } catch (error) {
    console.error(`❌ Error generating ${persona} response:`, error.message);
    throw error;
  }
}

// Export function to print usage summary
function printTokenSummary() {
  tokenTracker.printSummary();
}

module.exports = {
  generatePersonaResponse,
  printTokenSummary,
  tokenTracker
};
