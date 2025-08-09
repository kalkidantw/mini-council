"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import HeartAvatar from '@/components/ui/HeartAvatar'
import LogicAvatar from '@/components/ui/LogicAvatar'
import ShadowAvatar from '@/components/ui/ShadowAvatar'
import GlowingDots from '@/components/ui/GlowingDots'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, X } from "lucide-react"
import { playBase64Mp3 } from '../../lib/audio';
import { playDebate } from '../../lib/debatePlayer'

// Helper function to calculate speaking duration based on message length
const calculateSpeakingDuration = (message: string): number => {
  // Estimate ~15 characters per second for natural reading speed
  const baseDuration = Math.max(3, Math.ceil(message.length / 15));
  return baseDuration * 1000; // Convert to milliseconds
};

// Helper function to get persona emoji
const getPersonaEmoji = (persona: string): string => {
  switch (persona) {
    case "Heart": return "❤️";
    case "Logic": return "🧠";
    case "Shadow": return "😈";
    default: return "💭";
  }
};

// Helper function to generate a clear final decision
const generateFinalDecision = (conclusions: Array<{ persona: string; finalOpinion: string }>): string => {
  // Check if we have a unified resolution
  const unifiedResolution = conclusions.find(c => c.persona === "Unified Resolution");
  if (unifiedResolution) {
    return unifiedResolution.finalOpinion;
  }
  
  // Fallback to old format if needed
  const heartOpinion = conclusions.find(c => c.persona === "Heart")?.finalOpinion.toLowerCase() || "";
  const logicOpinion = conclusions.find(c => c.persona === "Logic")?.finalOpinion.toLowerCase() || "";
  const shadowOpinion = conclusions.find(c => c.persona === "Shadow")?.finalOpinion.toLowerCase() || "";
  
  // Check for positive/negative sentiment in each opinion
  const positiveWords = ["should", "recommend", "good", "beneficial", "positive", "proceed", "go ahead", "yes"];
  const negativeWords = ["shouldn't", "avoid", "bad", "risky", "negative", "don't", "no", "reconsider"];
  
  const heartPositive = positiveWords.some(word => heartOpinion.includes(word));
  const heartNegative = negativeWords.some(word => heartOpinion.includes(word));
  const logicPositive = positiveWords.some(word => logicOpinion.includes(word));
  const logicNegative = negativeWords.some(word => logicOpinion.includes(word));
  const shadowPositive = positiveWords.some(word => shadowOpinion.includes(word));
  const shadowNegative = negativeWords.some(word => shadowOpinion.includes(word));
  
  // Determine overall decision based on majority
  const positiveCount = [heartPositive, logicPositive, shadowPositive].filter(Boolean).length;
  const negativeCount = [heartNegative, logicNegative, shadowNegative].filter(Boolean).length;
  
  if (positiveCount >= 2) {
    return "Yes, you should proceed with this decision. The majority of your internal voices support this choice, recognizing both the emotional fulfillment and practical benefits it offers.";
  } else if (negativeCount >= 2) {
    return "No, you should reconsider this decision. Your internal voices have identified significant concerns that outweigh the potential benefits.";
  } else {
    return "Proceed with caution. While there are valid reasons to move forward, ensure you address the concerns raised by your more cautious internal voices before committing.";
  }
};



// Helper function to generate opinion summary
const generateOpinionSummary = (conclusions: Array<{ persona: string; finalOpinion: string }>): string => {
  // Check if we have a unified resolution
  const unifiedResolution = conclusions.find(c => c.persona === "Unified Resolution");
  if (unifiedResolution) {
    return "After thorough discussion, all three internal voices (Heart, Logic, and Shadow) have reached a unified conclusion. They have considered all perspectives and come to a definitive resolution that incorporates emotional, rational, and practical considerations.";
  }
  
  // Fallback to old format if needed
  const heartOpinion = conclusions.find(c => c.persona === "Heart")?.finalOpinion.toLowerCase() || "";
  const logicOpinion = conclusions.find(c => c.persona === "Logic")?.finalOpinion.toLowerCase() || "";
  const shadowOpinion = conclusions.find(c => c.persona === "Shadow")?.finalOpinion.toLowerCase() || "";
  
  // Check for agreement/disagreement patterns
  const positiveWords = ["should", "recommend", "good", "beneficial", "positive", "proceed", "go ahead", "yes"];
  const negativeWords = ["shouldn't", "avoid", "bad", "risky", "negative", "don't", "no", "reconsider"];
  
  const heartPositive = positiveWords.some(word => heartOpinion.includes(word));
  const heartNegative = negativeWords.some(word => heartOpinion.includes(word));
  const logicPositive = positiveWords.some(word => logicOpinion.includes(word));
  const logicNegative = negativeWords.some(word => logicOpinion.includes(word));
  const shadowPositive = positiveWords.some(word => shadowOpinion.includes(word));
  const shadowNegative = negativeWords.some(word => shadowOpinion.includes(word));
  
  // Determine agreement patterns
  const allPositive = heartPositive && logicPositive && shadowPositive;
  const allNegative = heartNegative && logicNegative && shadowNegative;
  const heartLogicAgree = (heartPositive && logicPositive) || (heartNegative && logicNegative);
  const heartShadowAgree = (heartPositive && shadowPositive) || (heartNegative && shadowNegative);
  const logicShadowAgree = (logicPositive && shadowPositive) || (logicNegative && shadowNegative);
  
  if (allPositive) {
    return "All three voices agreed that this is the right choice. Heart, Logic, and Shadow all see positive outcomes from proceeding with this decision.";
  } else if (allNegative) {
    return "All three voices expressed concerns about this decision. Heart, Logic, and Shadow all recommend against proceeding due to various risks and drawbacks.";
  } else if (heartLogicAgree && !shadowPositive && !shadowNegative) {
    return "Heart and Logic agreed on the best approach, while Shadow remained neutral or had mixed feelings about the decision.";
  } else if (heartShadowAgree && !logicPositive && !logicNegative) {
    return "Heart and Shadow found common ground, while Logic took a more measured or different stance on the matter.";
  } else if (logicShadowAgree && !heartPositive && !heartNegative) {
    return "Logic and Shadow agreed on the practical considerations, while Heart had a different emotional perspective on the decision.";
  } else {
    return "Each voice had a distinct perspective on this decision. Heart focused on emotional fulfillment, Logic emphasized practical considerations, and Shadow highlighted potential risks and concerns.";
  }
};

interface DebateMessage {
  persona: string;
  message: string;
  timestamp: number; // seconds from start
  audioData?: string; // base64 encoded audio data
}

interface DebateData {
  messages: DebateMessage[];
  conclusions: Array<{ persona: string; finalOpinion: string }>;
  totalDuration: number;
}

interface Persona {
  id: "Heart" | "Logic" | "Shadow";
  emoji: string;
  label: string;
  color: string;
  glowColor: string;
  value: number[];
  setValue: (value: number[]) => void;
}

// Loading bar component
function DebateLoadingBar({ isLoading }: { isLoading: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => (p < 95 ? p + Math.random() * 10 : p));
    }, 200);
    return () => clearInterval(interval);
  }, [isLoading]);
  useEffect(() => {
    if (!isLoading) setProgress(100);
  }, [isLoading]);
  return isLoading ? (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, margin: '16px 0' }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
        borderRadius: 3,
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)'
      }} />
    </div>
  ) : null;
}

export default function DebatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [heartValue, setHeartValue] = useState([100]);
  const [logicValue, setLogicValue] = useState([100]);
  const [shadowValue, setShadowValue] = useState([100]);
  const [showModal, setShowModal] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [dilemma, setDilemma] = useState("Loading your dilemma...");
  const [dilemmaId, setDilemmaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [debateData, setDebateData] = useState<DebateData | null>(null);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<Array<{ persona: string; message: string; emoji: string }>>([]);
  const [isDebateActive, setIsDebateActive] = useState(false);
  const [debateStartTime, setDebateStartTime] = useState<number | null>(null);
  const debateTimersRef = useRef<NodeJS.Timeout[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // --- Run state machine (idle -> running -> done) ---
  type RunState = 'idle' | 'running' | 'done';
  const [runState, setRunState] = useState<RunState>('idle');
  const startedRef = useRef(false);
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    // Start only once on mount (no SSR)
    if (startedRef.current) return;
    startedRef.current = true;

    const startDebateOnce = async () => {
      try {
        const id = searchParams.get('id') || '1';
        setDilemmaId(id);
        setIsLoading(true);

        // Fetch dilemma for header text
        try {
          const dRes = await fetch(`${BACKEND_BASE}/api/dilemma/${id}`);
          if (dRes.ok) {
            const dJson = await dRes.json();
            if (dJson?.dilemma?.prompt) setDilemma(dJson.dilemma.prompt);
          }
        } catch {}

        // Compute volume levels from sliders
      const volumeLevels = {
        Heart: Math.round(heartValue[0]),
        Logic: Math.round(logicValue[0]),
        Shadow: Math.round(shadowValue[0])
        } as const;

        setRunState('running');
        const r = await fetch(`${BACKEND_BASE}/api/debate/${id}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volumeLevels })
        });
        if (!r.ok) throw new Error(`debate respond failed: ${r.status}`);
        const data = await r.json();
        if (!data?.success || !data?.debate?.messages) throw new Error('Bad debate payload');

        // [FLOW] counts
        const counts = (data.debate.messages as DebateMessage[]).reduce((acc: Record<string, number>, m) => {
          acc[m.persona] = (acc[m.persona] || 0) + 1;
          return acc;
        }, {});
        console.log(`[FLOW] counts Heart=${counts.Heart || 0} Logic=${counts.Logic || 0} Shadow=${counts.Shadow || 0}`);

        setDebateData(data.debate);
        setIsLoading(false);
        await startDebateAnimation(data.debate, id);
        setRunState('done');
      } catch (err) {
        console.error('Failed to auto-start debate:', err);
        setIsLoading(false);
        setRunState('done');
      }
    };

    startDebateOnce();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Audio Gate ---
  const audioUnlockedRef = useRef(false);
  const audioQueueRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const unlock = () => {
      if (!audioUnlockedRef.current) {
        audioUnlockedRef.current = true;
        while (audioQueueRef.current.length) {
          const fn = audioQueueRef.current.shift();
          if (fn) fn();
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // --- Playback Controller ---
  const playDebateMessages = async (
    messages: DebateMessage[],
    debateId: string,
    index: number = 0
  ): Promise<void> => {
    if (index >= messages.length) {
      setIsDebateActive(false);
      setCurrentlySpeaking(null);
      setShowModal(true);
      return;
    }
    const message = messages[index];
    // [TURN] log
    const prev = messages[index - 1]?.message || '';
    const reactedToPrev = prev && message.message.includes(prev.split(' ').slice(-3).join(' '));
    const sentenceCount = (message.message.match(/[.!?]/g) || []).length;
    console.log(`[TURN] idx=${index} persona=${message.persona} sentences=${sentenceCount} reactedToPrev=${!!reactedToPrev}`);
    // [SYNC] log
    const textHash = (s: string) => s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    if (textHash(message.message) !== textHash(message.message)) {
      console.warn(`[SYNC] ttsFor=hash(text) does not match transcript=hash(text)`);
    } else {
      console.log(`[SYNC] ttsFor=hash(text) matchesTranscript=hash(text)`);
    }
    // 1) Activate persona
    setCurrentlySpeaking(message.persona);
    // 2) Append to transcript
    setVisibleMessages((prev) => [
      ...prev,
      {
        persona: message.persona,
        message: message.message,
        emoji: getPersonaEmoji(message.persona),
      },
    ]);
      setTimeout(() => {
        if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, 50);
    // 3) Play audio
    const playAudio = async () => {
      if (!message.audioData) {
        console.warn(`[AUDIO] missing for idx=${index} persona=${message.persona}`);
        await new Promise((r) => setTimeout(r, 2000));
        return;
      }
      try {
        console.log(`[AUDIO] start persona=${message.persona}`);
        await playBase64Mp3(message.audioData);
        console.log(`[AUDIO] success persona=${message.persona}`);
      } catch (err) {
        console.warn(`[AUDIO] failed persona=${message.persona} (using fallback)`, err);
        await new Promise((r) => setTimeout(r, 2000));
      }
      console.log(`[AUDIO] ended persona=${message.persona}`);
    };
    if (!audioUnlockedRef.current) {
      await new Promise<void>((resolve) => {
        audioQueueRef.current.push(async () => {
          await playAudio();
            resolve();
          });
      });
    } else {
      await playAudio();
    }
    // 4) Deactivate persona
    setCurrentlySpeaking(null);
    // 5) Advance
    await playDebateMessages(messages, debateId, index + 1);
  };

  // Make startDebateAnimation async and await the queue
  const startDebateAnimation = async (debate: DebateData, debateId: string) => {
    debateTimersRef.current.forEach(timer => clearTimeout(timer))
    debateTimersRef.current = []
    setVisibleMessages([])
    setCurrentlySpeaking(null)
    setIsDebateActive(true)
    setDebateStartTime(Date.now())
    console.log('🚦 Starting debate animation')

    const turns = debate.messages.map(m => ({ persona: m.persona, message: m.message, audioData: (m as any).audioData }))
    await playDebate(turns, {
      onActivate: (persona) => setCurrentlySpeaking(persona),
      onAppendTranscript: (persona, message) => setVisibleMessages(prev => ([...prev, { persona, message, emoji: getPersonaEmoji(persona) }])),
      onDeactivate: () => setCurrentlySpeaking(null)
    }, {
      gapMs: 350,
      firstTurnDeadlineMs: 1500,
      turnAudioDeadlineMs: 2500
    })
  }

  // Cleanup timers and audio on unmount
  useEffect(() => {
    return () => {
      debateTimersRef.current.forEach(timer => clearTimeout(timer))
      // if (currentAudio) { // Removed currentAudio cleanup
      //   currentAudio.pause();
      //   currentAudio.src = '';
      // }
    }
  }, [])

  // Blinking animation for avatar
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3000)
    return () => clearInterval(blinkInterval)
  }, [])

  // Personas config used by UI
  const personas: Persona[] = [
    {
      id: "Heart",
      emoji: "❤️",
      label: "Heart",
      color: "#FF5A79",
      glowColor: "#FF5A79",
      value: heartValue,
      setValue: setHeartValue,
    },
    {
      id: "Logic",
      emoji: "🧠",
      label: "Logic",
      color: "#9B6EFF",
      glowColor: "#9B6EFF",
      value: logicValue,
      setValue: setLogicValue,
    },
    {
      id: "Shadow",
      emoji: "😈",
      label: "Shadow",
      color: "#A64AC9",
      glowColor: "#A64AC9",
      value: shadowValue,
      setValue: setShadowValue,
    },
  ]

  return (
    <div className="min-h-screen bg-animated-deep font-sans relative overflow-hidden">
      <header className="flex items-center justify-between p-6 animate-fade-in-animated">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-animated-text-dim hover:text-animated-text-main transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      {/* Removed mute/unmute button */}
      </header>

      <div className="w-full flex flex-col items-center pt-0 pb-8 px-4 animate-fade-up-animated">
        <h1 className="text-4xl font-sf-bold text-animated-text-main text-center mb-2 drop-shadow-lg">
          What's Your Dilemma?
        </h1>
        <div className="text-lg text-animated-text-dim text-center mb-8 font-sf-bold">
          Your internal voices — Heart, Logic, and Shadow — are ready to weigh in.
        </div>
        <div className="max-w-xl w-full mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-6 shadow-inner border border-white/20 relative overflow-hidden" style={{boxShadow:'0 4px 32px 0 rgba(255,255,255,0.08) inset'}}>
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{background:'radial-gradient(ellipse at top left,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.00) 70%)'}} />
            <span className="relative text-xl font-semibold text-animated-text-main text-center block z-10">{dilemma}</span>
          </div>
        </div>
        <div className="flex justify-center gap-6 mb-2">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className={`transition-all duration-200 px-6 py-3 rounded-full text-2xl font-bold shadow-md border-2 ${
                currentlySpeaking === persona.id ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
              }`}
              style={{
                background: `linear-gradient(135deg, ${persona.color}22 0%, #23232344 100%)`,
                borderColor: persona.color,
                boxShadow: currentlySpeaking === persona.id ? `0 0 16px ${persona.color}55` : 'none',
                color: persona.color,
                filter: currentlySpeaking === persona.id ? 'brightness(1.2)' : 'none',
              }}
            >
              {persona.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Persona Cards with Glowing Dots */}
      <div className="flex justify-center gap-12 mb-12 px-4">
        {personas.map((persona) => (
          <div key={persona.id} className="flex flex-col items-center">
            {/* Avatar Card */}
          <div
              className={`w-72 h-96 rounded-3xl transition-all duration-500 mb-4 ${
                currentlySpeaking === persona.id
                ? "bg-animated-card-glass scale-105 animate-glow-speak-animated"
                  : "bg-animated-card-glass opacity-60"
            }`}
            style={{
              backdropFilter: "blur(12px)",
                border: currentlySpeaking === persona.id ? `3px solid ${persona.color}` : "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                  currentlySpeaking === persona.id
                    ? `0 0 50px ${persona.glowColor}60, 0 0 100px ${persona.glowColor}30, inset 0 1px 0 rgba(255,255,255,0.2)`
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
                transform: currentlySpeaking === persona.id ? "scale(1.05)" : "scale(1)",
            }}
          >
              <div className="w-full h-full flex items-center justify-center">
              {persona.id === "Heart" ? (
                  <HeartAvatar isSpeaking={currentlySpeaking === "Heart"} />
              ) : persona.id === "Logic" ? (
                  <LogicAvatar isSpeaking={currentlySpeaking === "Logic"} />
              ) : persona.id === "Shadow" ? (
                  <ShadowAvatar isSpeaking={currentlySpeaking === "Shadow"} />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: persona.color }}
                >
                  {persona.emoji}
                </div>
              )}
            </div>
            </div>
            {/* Glowing Dots - Positioned below each avatar card */}
            <GlowingDots
              value={persona.value[0]}
              personaColor={persona.color}
              personaGlowColor={persona.glowColor}
              isActive={currentlySpeaking === persona.id}
              onValueChange={(newValue) => persona.setValue([newValue])}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Transcript Box - Preserve Full Debate History */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div 
          ref={transcriptRef}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                style={{
            boxShadow: '0 8px 32px 0 rgba(255,255,255,0.08) inset',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
          }}
        >
          {isDebateActive && visibleMessages.length > 0 ? (
            <div className="space-y-4">
              {visibleMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-white/10 backdrop-blur-sm border border-white/20">
                      {msg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-animated-text-main font-sf-bold text-sm">{msg.persona}</span>
                        <div className="w-2 h-2 rounded-full bg-animated-text-dim/50"></div>
                      </div>
                      <p className="text-animated-text-main text-sm leading-relaxed font-sf-body">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isDebateActive ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-2 animate-pulse">🎭</div>
                <p className="text-animated-text-dim text-sm font-sf-medium">Debate starting...</p>
                <p className="text-animated-text-dim text-xs mt-1 font-sf-body">Your internal voices are preparing to speak</p>
              </div>
              </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-2 animate-pulse">⚡</div>
                <p className="text-animated-text-dim text-sm font-sf-medium">Loading debate...</p>
                <p className="text-animated-text-dim text-xs mt-1 font-sf-body">Preparing your internal dialogue</p>
              </div>
            </div>
          ) : debateData && visibleMessages.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-animated-text-main font-sf-medium">Debate Completed</p>
              </div>
              {/* Show the full debate history - preserve all messages */}
              <div className="space-y-4">
                {visibleMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        {msg.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-animated-text-main font-sf-bold text-sm">{msg.persona}</span>
                          <div className="w-2 h-2 rounded-full bg-animated-text-dim/50"></div>
                        </div>
                        <p className="text-animated-text-main text-sm leading-relaxed font-sf-body">{msg.message}</p>
                      </div>
              </div>
            </div>
          ))}
        </div>
      </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-2">💭</div>
                <p className="text-animated-text-dim text-sm font-sf-body">Transcript will appear here...</p>
                <p className="text-animated-text-dim text-xs mt-1 font-sf-body">This is where the conversation between your internal voices will be displayed.</p>
              </div>
          </div>
          )}
        </div>
      </div>

      {/* Synthesize Wisdom Button - Always Visible */}
      <div className="flex justify-center pb-8">
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-animated-wisdom hover:opacity-90 text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-150 hover:scale-105 active:scale-97 shadow-xl border-0"
        >
          Synthesize Wisdom
        </Button>
      </div>

      {/* Enhanced Modal with Three Distinct Sections */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in-animated">
          <div className="bg-animated-card-glass backdrop-blur-xl rounded-2xl w-full max-w-3xl mx-4 p-8 border border-white/10 shadow-animated-modal max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-animated-text-main">Synthesized Wisdom</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-animated-text-dim hover:text-animated-text-main transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 1. Balanced Perspective Section */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-lg font-semibold text-animated-text-main mb-3 flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  Balanced Perspective
                </h4>
                <p className="text-animated-text-main text-sm leading-relaxed">
                  {debateData?.conclusions ? (
                    `After carefully considering all perspectives in your internal debate, the balanced view recognizes that this decision involves both emotional and practical considerations. Your Heart emphasizes the importance of following your feelings and what brings you genuine happiness, while Logic focuses on the concrete facts, consequences, and long-term implications. Shadow reminds us to be realistic about potential risks and protect your interests. The most balanced approach acknowledges that while emotions guide us toward what feels right, practical considerations help ensure sustainable outcomes, and realistic expectations prevent disappointment.`
                  ) : (
                    "After weighing your emotional instincts, logical analysis, and potential concerns, the balanced perspective recognizes that this decision involves both heart and mind. Your emotional desires point toward what brings you genuine happiness, while practical considerations help ensure sustainable outcomes. Realistic expectations protect you from disappointment while still allowing for meaningful progress."
                  )}
                </p>
              </div>

              {/* 2. Final Decision Section */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-lg font-semibold text-animated-text-main mb-3 flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  Final Decision
                </h4>
                <p className="text-animated-text-main text-sm leading-relaxed font-medium">
                  {debateData?.conclusions ? (
                    generateFinalDecision(debateData.conclusions)
                  ) : (
                    "Based on the internal debate, you should proceed with this decision while remaining mindful of both your emotional needs and practical considerations."
                  )}
                </p>
              </div>

              {/* 3. Opinion Summary Section */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-lg font-semibold text-animated-text-main mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Opinion Summary
                </h4>
                {debateData?.conclusions ? (
                  <div className="space-y-3">
                    <p className="text-animated-text-main text-sm leading-relaxed mb-3">
                      {generateOpinionSummary(debateData.conclusions)}
                    </p>
                    <div className="space-y-2">
                      {debateData.conclusions.map((conclusion, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white/3 rounded p-2">
                          <span className="text-lg flex-shrink-0">{getPersonaEmoji(conclusion.persona)}</span>
                          <div>
                            <span className="text-animated-text-main font-medium text-sm">{conclusion.persona}:</span>
                            <p className="text-animated-text-main text-sm leading-relaxed mt-1">{conclusion.finalOpinion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-animated-text-main text-sm leading-relaxed">
                    Each voice brought unique insights: Heart emphasized emotional fulfillment and following your feelings, Logic focused on practical considerations and long-term consequences, and Shadow highlighted potential risks and concerns.
                  </p>
                )}
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-animated-text-dim text-xs leading-relaxed italic">
                This is AI-generated and not a substitute for professional advice. Always check facts and consult a licensed expert if needed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              {personas.map((persona) => (
                <div key={persona.id} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg mb-2 mx-auto"
                    style={{ backgroundColor: persona.color }}
                  >
                    {persona.emoji}
                  </div>
                  <span className="text-animated-text-main font-sf-medium text-lg font-bold">{persona.value[0]}%</span>
                  <div className="text-animated-text-dim text-xs mt-1">{persona.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
