// CommonJS TTS module for Node.js v20+
// Logs on load and provides a stub fallback when no API key is present

console.log("✅ TTS module loaded from backend/lib/tts.js");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

/**
 * Synthesize TTS using OpenAI when available; otherwise returns a stub.
 * @param {string} text
 * @param {string} voiceId
 * @returns {Promise<{ base64: string, ms?: number }>}
 */
async function synthesizeTTS(text, voiceId) {
  // If no API key, return stub so the server can boot cleanly
  if (!OPENAI_API_KEY) {
    return { base64: "", ms: 0 };
  }

  try {
    const response = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceId,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`TTS API error: ${response.status} ${body}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    // Rough estimate if provider doesn't return duration
    const ms = Math.max(2000, Math.ceil((text || '').length / 15) * 1000);
    return { base64, ms };
  } catch (err) {
    console.error('❌ TTS synthesis failed:', err?.message || err);
    // Fallback to stub to keep the flow moving
    return { base64: "", ms: 0 };
  }
}

module.exports = { synthesizeTTS }; 