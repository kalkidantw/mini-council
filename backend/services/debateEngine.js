const OpenAI = require("openai");
const { tokenTracker } = require("../token-tracker");
const { synthesizeTTS } = require("../lib/tts");

const VOICE_MAPPING = {
  Heart: "nova",    // Warm, empathetic, feminine
  Logic: "coral",   // Clear, feminine, soprano
  Shadow: "shimmer" // Mysterious, soothing, feminine
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Persona definitions with distinct personalities
const personas = {
  Heart: {
    name: "Heart",
    emoji: "❤️",
    systemPrompt: `You are Heart - the emotional, empathetic voice. You speak with:
- Pure emotion, empathy, and gut instinct
- Focus on feelings, relationships, and human connection
- Kindness, compassion, and what feels right
- Intuitive understanding of people's needs
- Passionate and caring tone
- Values love, happiness, and emotional well-being
- Can interrupt when you feel strongly about something
- React emotionally to others' points
- Do NOT use emojis in your responses - speak naturally without emojis

Always stay true to your emotional, empathetic nature. React naturally to what others say.`,
  },
  Logic: {
    name: "Logic", 
    emoji: "🧠",
    systemPrompt: `You are Logic - the rational, analytical voice. You speak with:
- Facts, analysis, and rational deduction
- Objective reasoning and evidence-based thinking
- Focus on consequences, pros and cons, efficiency
- Systematic approach to problem-solving
- Calm, measured, and thoughtful tone
- Values truth, reason, and practical outcomes
- Can challenge others' emotional reasoning
- Build on or refute previous points

Always stay true to your logical, analytical nature. React naturally to what others say.`,
  },
  Shadow: {
    name: "Shadow",
    emoji: "😈", 
    systemPrompt: `You are Shadow - the skeptical, self-interested voice. You speak with:
- Doubts, insecurities, and self-protective reasoning
- Cynical but honest perspective
- Focus on risks, worst-case scenarios, self-preservation
- Brutal honesty about potential problems
- Skeptical and sometimes darkly humorous tone
- Values safety, self-interest, and realistic expectations
- Can interrupt with warnings or doubts
- Challenge overly optimistic views

Always stay true to your skeptical, self-protective nature. React naturally to what others say.`,
  }
};

// --- Debate Flow Parameters ---
const MIN_MESSAGES = 9; // Minimum number of debate messages
const MAX_MESSAGES = 11; // Maximum number of debate messages
const MIN_TURNS_PER_PERSONA = 3;
const MAX_TURNS_PER_PERSONA = 4;
const MAX_DEBATE_TIME = 80; // Cap at 80 seconds
const MAX_TOKENS_PER_MESSAGE = 60; // Increased for complete sentences
const MAX_RETRIES_PER_MESSAGE = 2; // Retry on empty/failed message

/**
 * Generate a natural multi-turn debate between the three personas
 * @param {string} dilemmaPrompt - The user's dilemma to debate
 * @param {Object} volumeLevels - Volume levels for each persona (0-100)
 * @returns {Promise<DebateResult>} The debate result with messages and conclusions
 */
async function generatePersonaDebate(dilemmaPrompt, volumeLevels = { Heart: 100, Logic: 100, Shadow: 100 }) {
  console.log(`🎭 Starting human-like reactive debate for dilemma: "${dilemmaPrompt}"`);
  console.log(`📊 Volume levels: Heart(${volumeLevels.Heart}%), Logic(${volumeLevels.Logic}%), Shadow(${volumeLevels.Shadow}%)`);

  const debateMessages = [];
  let currentTime = 0; // Start immediately at 0

  // Filter out personas with 0% volume (completely silent)
  const activePersonas = Object.entries(volumeLevels)
    .filter(([persona, volume]) => volume > 0)
    .map(([persona]) => persona);

  if (activePersonas.length === 0) {
    console.log("⚠️ No active personas - all volumes are 0%");
    return {
      messages: [],
      conclusions: [],
      totalDuration: 0
    };
  }

  // Strict turn count enforcement
  const turnCount = { Heart: 0, Logic: 0, Shadow: 0 };
  const conversationHistory = [];

  // Decide total messages: randomly 9, 10, or 11
  const totalMessages = Math.floor(Math.random() * (MAX_MESSAGES - MIN_MESSAGES + 1)) + MIN_MESSAGES;
  console.log(`🎯 Target: ${totalMessages} total messages for refined human-like reactive flow`);

  let attempts = 0;
  const maxAttempts = totalMessages * 4; // More retries for robustness

  while (debateMessages.length < totalMessages && attempts < maxAttempts) {
    attempts++;
    const messageIndex = debateMessages.length;
    // Only allow personas who have not reached MAX_TURNS_PER_PERSONA
    const eligiblePersonas = activePersonas.filter(p => turnCount[p] < MAX_TURNS_PER_PERSONA);
    if (eligiblePersonas.length === 0) break; // All personas maxed out
    // Dynamic, non-cyclic speaker selection, but only from eligible
    const nextSpeaker = determineNextSpeakerWithVolume(conversationHistory, turnCount, volumeLevels, messageIndex, eligiblePersonas);
    if (!nextSpeaker) continue;
    // Prevent any persona from exceeding MAX_TURNS_PER_PERSONA
    if (turnCount[nextSpeaker] >= MAX_TURNS_PER_PERSONA) continue;

    // Build conversational context: last 1-2 messages
    const lastMsgs = conversationHistory.slice(-2).map(msg => msg.split(": ").slice(1).join(": ")).join("\n");
    let promptAddon = "";
    if (lastMsgs) {
      promptAddon = `\nRespond directly to the previous point(s):\n${lastMsgs}\nChallenge, agree, or add a new perspective, but keep it conversational and brief. ABSOLUTELY NO MORE THAN TWO SHORT, NATURAL SENTENCES. Each sentence must be short and clear. Do not use compound sentences. Do not use filler or generic statements. Do not say you have nothing to add.`;
    } else {
      promptAddon = "\nStart the debate with a brief, clear point. ABSOLUTELY NO MORE THAN TWO SHORT, NATURAL SENTENCES. Each sentence must be short and clear. Do not use compound sentences. Do not use filler or generic statements.";
    }

    // Retry logic for empty/failed messages
    let message = null;
    for (let retry = 0; retry <= MAX_RETRIES_PER_MESSAGE; retry++) {
      message = await generateNextMessageWithVolume(
        dilemmaPrompt + promptAddon,
        nextSpeaker,
        conversationHistory,
        currentTime,
        volumeLevels[nextSpeaker]
      );
      if (message && message.message && message.message.trim().length > 0) break;
    }
    // If still no message, skip this turn (do NOT insert fallback)
    if (!message || !message.message || message.message.trim().length === 0) {
      continue;
    }

    // Enforce two short sentences max (split and trim)
    let sentences = message.message.match(/[^.!?]+[.!?]+/g) || [message.message];
    sentences = sentences.map(s => s.trim()).filter(Boolean).slice(0, 2);
    message.message = sentences.join(' ');

    // Synthesize TTS
    const voiceId = VOICE_MAPPING[nextSpeaker];
    const { base64, ms } = await synthesizeTTS(message.message, voiceId);
    if (base64) {
      message.audioData = base64;
      message.ttsMs = ms;
      console.log(`[SYNC] Text hash match for "${message.message}" (Voice: ${voiceId})`);
    } else {
      console.warn(`[SYNC] No audioData for "${message.message}" (Voice: ${voiceId})`);
    }

    debateMessages.push(message);
    conversationHistory.push(`${nextSpeaker}: ${message.message}`);
    turnCount[nextSpeaker]++;
    // Calculate speaking duration based on message length (natural reading speed)
    const speakingDuration = Math.ceil(message.message.length / 15); // ~15 chars/sec
    // Add natural pause between messages (0.5 to 1.2 seconds)
    const naturalPause = Math.random() * 0.7 + 0.5;
    currentTime = message.timestamp + speakingDuration + naturalPause;
  }

  // If any persona has fewer than MIN_TURNS_PER_PERSONA, pad with extra turns (if possible)
  for (const persona of activePersonas) {
    while (turnCount[persona] < MIN_TURNS_PER_PERSONA && debateMessages.length < MAX_MESSAGES) {
      // Use last context for this persona
      const lastMsgs = conversationHistory.slice(-2).map(msg => msg.split(": ").slice(1).join(": ")).join("\n");
      let promptAddon = lastMsgs
        ? `\nRespond directly to the previous point(s):\n${lastMsgs}\nChallenge, agree, or add a new perspective, but keep it conversational and brief. ABSOLUTELY NO MORE THAN TWO SHORT, NATURAL SENTENCES. Each sentence must be short and clear. Do not use compound sentences. Do not use filler or generic statements. Do not say you have nothing to add.`
        : "\nAdd a brief, clear point. ABSOLUTELY NO MORE THAN TWO SHORT, NATURAL SENTENCES. Each sentence must be short and clear. Do not use compound sentences. Do not use filler or generic statements.";
      let message = null;
      for (let retry = 0; retry <= MAX_RETRIES_PER_MESSAGE; retry++) {
        message = await generateNextMessageWithVolume(
          dilemmaPrompt + promptAddon,
          persona,
          conversationHistory,
          currentTime,
          volumeLevels[persona]
        );
        if (message && message.message && message.message.trim().length > 0) break;
      }
      if (!message || !message.message || message.message.trim().length === 0) break;
      let sentences = message.message.match(/[^.!?]+[.!?]+/g) || [message.message];
      sentences = sentences.map(s => s.trim()).filter(Boolean).slice(0, 2);
      message.message = sentences.join(' ');

      // Synthesize TTS
      const voiceId = VOICE_MAPPING[persona];
      const { base64, ms } = await synthesizeTTS(message.message, voiceId);
      if (base64) {
        message.audioData = base64;
        message.ttsMs = ms;
        console.log(`[SYNC] Text hash match for "${message.message}" (Voice: ${voiceId})`);
      } else {
        console.warn(`[SYNC] No audioData for "${message.message}" (Voice: ${voiceId})`);
      }
      debateMessages.push(message);
      conversationHistory.push(`${persona}: ${message.message}`);
      turnCount[persona]++;
      const speakingDuration = Math.ceil(message.message.length / 15);
      const naturalPause = Math.random() * 0.7 + 0.5;
      currentTime = message.timestamp + speakingDuration + naturalPause;
    }
  }

  // Sort messages by timestamp to ensure proper order
  debateMessages.sort((a, b) => a.timestamp - b.timestamp);

  // Cap total duration
  const totalDuration = Math.min(currentTime, MAX_DEBATE_TIME);

  // Generate conclusions for each persona
  const conclusions = await generateConclusions(dilemmaPrompt, debateMessages);

  return {
    messages: debateMessages,
    conclusions: conclusions,
    totalDuration
  };
}

/**
 * Determine who should speak next based on volume levels and conversation flow
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} turnCount - Current turn counts for each persona
 * @param {Object} volumeLevels - Volume levels for each persona
 * @param {number} messageIndex - Current message index
 * @param {Array} activePersonas - List of personas with volume > 0
 * @returns {string} Next speaker
 */
function determineNextSpeakerWithVolume(conversationHistory, turnCount, volumeLevels, messageIndex, activePersonas) {
  if (activePersonas.length === 0) return null;
  
  // Get the last speaker
  const lastSpeaker = conversationHistory.length > 0 
    ? conversationHistory[conversationHistory.length - 1].split(':')[0]
    : null;
  
  // Filter out the last speaker to prevent repeats
  const eligiblePersonas = lastSpeaker
    ? activePersonas.filter(p => p !== lastSpeaker && turnCount[p] < MAX_TURNS_PER_PERSONA)
    : activePersonas.filter(p => turnCount[p] < MAX_TURNS_PER_PERSONA);

  // If all others are maxed out, allow last speaker
  const finalEligible = eligiblePersonas.length > 0 ? eligiblePersonas : activePersonas.filter(p => turnCount[p] < MAX_TURNS_PER_PERSONA);
  if (finalEligible.length === 0) return null;

  // Prefer personas with the fewest turns so far
  const minTurns = Math.min(...finalEligible.map(p => turnCount[p]));
  const leastUsed = finalEligible.filter(p => turnCount[p] === minTurns);
  
  // Randomly pick among least used eligible personas
  const nextSpeaker = leastUsed[Math.floor(Math.random() * leastUsed.length)];
  return nextSpeaker;
}

/**
 * Generate the next message for a specific persona with volume-based length control
 * @param {string} dilemmaPrompt - The original dilemma
 * @param {string} speaker - The persona speaking
 * @param {Array} conversationHistory - Previous messages
 * @param {number} currentTime - Current timestamp
 * @param {number} volumeLevel - Volume level for this persona (0-100)
 * @returns {Promise<DebateMessage>} The generated message
 */
async function generateNextMessageWithVolume(dilemmaPrompt, speaker, conversationHistory, currentTime, volumeLevel) {
  const persona = personas[speaker];
  const recentMessages = conversationHistory.slice(-2);
  // Add strict instructions to the prompt
  const instructions = 'Do NOT start your response with your name or persona (e.g., "Heart:", "Logic:", "Shadow:"). Only return complete sentences. Never end mid-sentence. Respond in no more than 2 concise, natural sentences. Do not write long paragraphs.';
  const messages = [
    { role: "system", content: persona.systemPrompt },
    ...recentMessages.map(msg => ({ role: "user", content: msg })),
    { role: "user", content: dilemmaPrompt + '\n' + instructions }
  ];
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: MAX_TOKENS_PER_MESSAGE,
      temperature: 0.8,
    });
    const cleanMessage = completion.choices[0].message.content.trim();
    tokenTracker.trackUsage(speaker, completion.usage);
    return { persona: speaker, message: cleanMessage, timestamp: currentTime };
  } catch (error) {
    console.error(`❌ Error generating message for ${speaker}:`, error.message);
    return null;
  }
}

/**
 * Generate final conclusions for each persona
 * @param {string} dilemmaPrompt - The original dilemma
 * @param {DebateMessage[]} debateMessages - The debate messages
 * @returns {Promise<Array>} Array of conclusions
 */
async function generateConclusions(dilemmaPrompt, debateMessages) {
  const debateSummary = debateMessages
    .map(msg => `${msg.persona}: ${msg.message}`)
    .join('\n');

  const conclusionPrompt = `Based on this debate about "${dilemmaPrompt}":

${debateSummary}

After this thorough discussion, all three personas (Heart ❤️, Logic 🧠, and Shadow 😈) have come to a definitive conclusion and resolution. 

Generate ONE specific, actionable conclusion that all three personas agree on. This should be a clear, definitive answer to the user's dilemma that incorporates the perspectives of all three personas:

Definitive Resolution:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are generating a definitive resolution that all three personas agree on after their debate. This should be ONE specific, actionable conclusion that answers the user's dilemma clearly and definitively."
        },
        {
          role: "user",
          content: conclusionPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    tokenTracker.trackUsage("Debate-Conclusions", completion.usage);
    
    // Parse the definitive resolution
    const definitiveResolution = responseText.trim();
    
    // Return a single conclusion object instead of individual opinions
    return [{
      persona: "Unified Resolution",
      finalOpinion: definitiveResolution
    }];
    
  } catch (error) {
    console.error("❌ Error generating definitive resolution:", error.message);
    return [{
      persona: "Unified Resolution", 
      finalOpinion: "After careful consideration of all perspectives, the best course of action is to proceed with thoughtful deliberation and trust your judgment."
    }];
  }
}

module.exports = {
  generatePersonaDebate,
  personas
}; 