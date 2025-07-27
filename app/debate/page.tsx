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
import { ArrowLeft, X, Volume2, VolumeX } from "lucide-react"

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

export default function DebatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [heartValue, setHeartValue] = useState([100])
  const [logicValue, setLogicValue] = useState([100])
  const [shadowValue, setShadowValue] = useState([100])
  const [activePersona, setActivePersona] = useState<"Heart" | "Logic" | "Shadow">("Heart")
  const [showModal, setShowModal] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [dilemma, setDilemma] = useState("Loading your dilemma...")
  const [dilemmaId, setDilemmaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Debate timing and animation states
  const [debateData, setDebateData] = useState<DebateData | null>(null)
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null)
  const [visibleMessages, setVisibleMessages] = useState<Array<{ persona: string; message: string; emoji: string }>>([])
  const [isDebateActive, setIsDebateActive] = useState(false)
  const [debateStartTime, setDebateStartTime] = useState<number | null>(null)
  const debateTimersRef = useRef<NodeJS.Timeout[]>([])
  const transcriptRef = useRef<HTMLDivElement>(null)

  // TTS audio management
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const audioQueueRef = useRef<HTMLAudioElement[]>([])
  const isPlayingRef = useRef(false)

  // Add a ref to track if the debate queue is running
  const queueRunningRef = useRef(false)

  // Get dilemma ID from URL query parameter and auto-start debate
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setDilemmaId(id)
      fetchDilemma(id)
      fetchAndStartDebate(id)
    } else {
      // Auto-start debate with fallback dilemma when no ID provided
      console.log("🎭 No dilemma ID found, starting debate with fallback dilemma")
      setDilemma("Should I drop my Tuesday class?") // Fallback
      setIsLoading(false)
      // Start debate immediately with fallback dilemma
      startDebateWithFallback()
    }
  }, [searchParams])

  // Start debate with fallback dilemma when no ID is provided
  const startDebateWithFallback = async () => {
    try {
      console.log("🎭 Starting debate with fallback dilemma...")
      
      // Calculate volume levels from persona slider values
      const volumeLevels = {
        Heart: Math.round(heartValue[0]),
        Logic: Math.round(logicValue[0]),
        Shadow: Math.round(shadowValue[0])
      }
      
      console.log("📊 Volume levels being sent:", volumeLevels)
      
      // Use a default dilemma ID (1) for fallback scenarios
      const response = await fetch(`http://localhost:3001/api/debate/1/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volumeLevels }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch debate: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Fallback debate data received:", data)
      
      if (data.success && data.debate) {
        setDebateData(data.debate)
        await startDebateAnimation(data.debate)
      }
    } catch (error) {
      console.error("Error starting fallback debate:", error)
      // Even if API fails, show a basic debate state
      setIsDebateActive(true)
    }
  }

  // Fetch dilemma from backend
  const fetchDilemma = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/dilemma/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDilemma(data.dilemma.prompt)
      } else {
        setDilemma("Should I drop my Tuesday class?") // Fallback
      }
    } catch (error) {
      console.error("Error fetching dilemma:", error)
      setDilemma("Should I drop my Tuesday class?") // Fallback
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch and start the debate
  const fetchAndStartDebate = async (id: string) => {
    try {
      console.log("🎭 Fetching debate data...")
      
      // Calculate volume levels from persona slider values
      const volumeLevels = {
        Heart: Math.round(heartValue[0]), // Convert slider value to percentage
        Logic: Math.round(logicValue[0]),
        Shadow: Math.round(shadowValue[0])
      }
      
      console.log("📊 Volume levels being sent:", volumeLevels)
      
      const response = await fetch(`http://localhost:3001/api/debate/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volumeLevels }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch debate: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Debate data received:", data)
      
      if (data.success && data.debate) {
        setDebateData(data.debate)
        await startDebateAnimation(data.debate)
      }
    } catch (error) {
      console.error("Error fetching debate:", error)
    }
  }

  // --- SYNC FLOW: Perfectly sync transcript, animation, and audio ---

  // New: Play the debate as a queue, only advancing after audio ends
  const playDebateQueue = async (messages: DebateMessage[]) => {
    if (queueRunningRef.current) {
      console.warn('Debate queue already running, skipping new queue start.')
      return
    }
    queueRunningRef.current = true
    console.log('🟢 Debate queue started')
    setVisibleMessages([])
    setCurrentlySpeaking(null)
    setIsDebateActive(true)
    setDebateStartTime(Date.now())

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      console.log(`🔊 Playing message ${i + 1}/${messages.length}: ${message.persona}`)
      // Wait for audio to play and finish before moving to next
      await playMessageWithSync(message)
      console.log(`✅ Finished message ${i + 1}/${messages.length}: ${message.persona}`)
    }

    // Debate finished
    setIsDebateActive(false)
    setCurrentlySpeaking(null)
    setDebateStartTime(null)
    queueRunningRef.current = false
    console.log('🛑 Debate queue finished, showing modal')
    setShowModal(true)
  }

  // Play a single message with perfect sync
  const playMessageWithSync = async (message: DebateMessage) => {
    return new Promise<void>(async (resolve) => {
      let audio: HTMLAudioElement | null = null
      let waitingTimeout: NodeJS.Timeout | null = null
      let fallbackTimeout: NodeJS.Timeout | null = null
      let hasStarted = false;
      let hasEnded = false;
      let waitingForAudio = false;

      if (message.audioData && isAudioEnabled) {
        // Convert base64 to blob
        const byteCharacters = atob(message.audioData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        audio = new Audio(URL.createObjectURL(blob));
        setCurrentAudio(audio);
      }

      // Handler: when audio actually starts
      const onPlay = () => {
        if (hasStarted) return;
        hasStarted = true;
        if (waitingTimeout) clearTimeout(waitingTimeout);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        waitingForAudio = false;
        // Show transcript line
        setVisibleMessages(prev => [...prev, {
          persona: message.persona,
          message: message.message,
          emoji: getPersonaEmoji(message.persona)
        }])
        // Start avatar animation
        setCurrentlySpeaking(message.persona)
        // Auto-scroll transcript
        setTimeout(() => {
          if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
          }
        }, 50)
      }

      // Handler: when audio ends
      const onEnded = () => {
        if (hasEnded) return;
        hasEnded = true;
        if (waitingTimeout) clearTimeout(waitingTimeout);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        setCurrentlySpeaking(null)
        setCurrentAudio(null)
        resolve()
      }

      if (audio) {
        audio.playbackRate = 1.15;
        audio.addEventListener('play', onPlay)
        audio.addEventListener('ended', onEnded)
        audio.addEventListener('error', () => {
          // Fallback: show transcript/animation even if audio fails
          if (!hasStarted) onPlay()
          if (!hasEnded) onEnded()
        })
        // Wait for audio to load, then play
        await new Promise((resolveLoad, reject) => {
          audio.addEventListener('canplaythrough', resolveLoad)
          audio.addEventListener('error', reject)
          audio.load()
        })
        // Start a 1s timer: if audio doesn't start, show waiting state
        waitingTimeout = setTimeout(() => {
          if (!hasStarted) {
            waitingForAudio = true;
            // Optionally, show a loading spinner or message here
            // e.g. setWaitingForAudio(true)
          }
        }, 1000)
        // Fallback: after 5s, show transcript/animation anyway
        fallbackTimeout = setTimeout(() => {
          if (!hasStarted) onPlay()
        }, 5000)
        audio.play()
      } else {
        // No audio: show transcript/animation immediately, wait a bit, then resolve
        onPlay()
        setTimeout(onEnded, calculateSpeakingDuration(message.message))
      }
    })
  }

  // Make startDebateAnimation async and await the queue
  const startDebateAnimation = async (debate: DebateData) => {
    debateTimersRef.current.forEach(timer => clearTimeout(timer))
    debateTimersRef.current = []
    setVisibleMessages([])
    setCurrentlySpeaking(null)
    setIsDebateActive(true)
    setDebateStartTime(Date.now())
    console.log('🚦 Starting debate animation')
    await playDebateQueue(debate.messages)
  }

  // TTS helper functions
  const playTTSAudio = async (audioData: string): Promise<void> => {
    if (!isAudioEnabled) return;
    
    try {
      const startTime = Date.now()
      console.log(`🎵 Audio playback starting...`)
      
      // Convert base64 to blob
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      
      // Create audio element
      const audio = new Audio(URL.createObjectURL(blob));
      setCurrentAudio(audio);
      
      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });
      
      console.log(`🎵 Audio loaded (${Date.now() - startTime}ms)`)
      
      // Play audio and wait for it to actually start
      const playPromise = audio.play();
      await playPromise;
      
      console.log(`🎵 Audio playing (${Date.now() - startTime}ms)`)
      
      // Wait for audio to finish
      await new Promise<void>((resolve) => {
        audio.addEventListener('ended', () => {
          console.log(`🎵 Audio finished (${Date.now() - startTime}ms)`)
          setCurrentAudio(null);
          resolve();
        });
      });
      
      // Cleanup
      URL.revokeObjectURL(audio.src);
    } catch (error) {
      console.error('Error playing TTS audio:', error);
      setCurrentAudio(null);
    }
  };

  const queueTTSAudio = async (audioData: string): Promise<void> => {
    if (!isAudioEnabled) return;
    
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      await playTTSAudio(audioData);
      isPlayingRef.current = false;
      
      // Play next in queue if available
      if (audioQueueRef.current.length > 0) {
        const nextAudio = audioQueueRef.current.shift()!;
        await playTTSAudio(nextAudio.src);
      }
    } else {
      // Add to queue
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const audio = new Audio(URL.createObjectURL(blob));
      audioQueueRef.current.push(audio);
    }
  };

  // Cleanup timers and audio on unmount
  useEffect(() => {
    return () => {
      debateTimersRef.current.forEach(timer => clearTimeout(timer))
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      audioQueueRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    }
  }, [currentAudio])

  // Blinking animation for avatar
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3000)
    return () => clearInterval(blinkInterval)
  }, [])

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
        <button
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
            isAudioEnabled 
              ? 'text-animated-text-main bg-white/10 hover:bg-white/20' 
              : 'text-animated-text-dim bg-white/5 hover:bg-white/10'
          }`}
        >
          {isAudioEnabled ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">Mute</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="text-sm font-medium">Unmute</span>
            </>
          )}
        </button>
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
