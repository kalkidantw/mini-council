const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch
});

// Voice mapping for each persona (all feminine voices)
const VOICE_MAPPING = {
  Heart: "nova",    // Warm, empathetic, feminine
  Logic: "coral",   // Clear, feminine, soprano
  Shadow: "shimmer" // Mysterious, soothing, feminine
};

/**
 * Generate TTS audio for a message
 * @param {string} text - The text to convert to speech
 * @param {string} persona - The persona speaking (Heart, Logic, Shadow)
 * @returns {Promise<Buffer>} Audio buffer
 */
async function generateTTSAudio(text, persona) {
  try {
    const voice = VOICE_MAPPING[persona];
    if (!voice) {
      throw new Error(`Unknown persona: ${persona}`);
    }

    console.log(`🎤 Generating TTS for ${persona} (${voice}): "${text.substring(0, 50)}..."`);

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ TTS generated for ${persona}: ${buffer.length} bytes`);
    
    return buffer;
  } catch (error) {
    console.error(`❌ TTS generation failed for ${persona}:`, error.message);
    throw error;
  }
}

/**
 * Generate TTS audio for multiple messages
 * @param {Array} messages - Array of {persona, message, timestamp} objects
 * @returns {Promise<Array>} Array of {persona, message, timestamp, audioBuffer} objects
 */
async function generateTTSForMessages(messages) {
  console.log(`🎤 Generating TTS for ${messages.length} messages...`);
  
  const results = [];
  
  for (const message of messages) {
    try {
      // Debug: log transcript and TTS input
      console.log(`[SYNC CHECK] Transcript: "${message.message}"`);
      // Enforce: TTS input must be exactly the transcript
      const ttsInput = message.message;
      if (ttsInput !== message.message) {
        console.warn(`[SYNC WARNING] Transcript and TTS input differ! Transcript: "${message.message}" | TTS: "${ttsInput}"`);
      }
      const audioBuffer = await generateTTSAudio(ttsInput, message.persona);
      // Debug: log TTS input again (should be identical)
      console.log(`[SYNC CHECK] TTS Input: "${ttsInput}"`);
      results.push({
        ...message,
        audioBuffer
      });
    } catch (error) {
      console.error(`Failed to generate TTS for message:`, message, error);
      // Continue with other messages even if one fails
      results.push({
        ...message,
        audioBuffer: null
      });
    }
  }
  
  console.log(`✅ TTS generation completed: ${results.filter(r => r.audioBuffer).length}/${messages.length} successful`);
  return results;
}

module.exports = {
  generateTTSAudio,
  generateTTSForMessages,
  VOICE_MAPPING
}; 