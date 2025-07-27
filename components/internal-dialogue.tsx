"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export default function InternalDialogue() {
  const [selectedAvatar, setSelectedAvatar] = useState<"heart" | "logic" | "shadow">("heart")
  const [heartValue, setHeartValue] = useState([75])
  const [logicValue, setLogicValue] = useState([75])
  const [shadowValue, setShadowValue] = useState([75])

  const avatars = [
    {
      id: "heart" as const,
      emoji: "❤️",
      label: "Heart",
      glow: "#FC495D",
      value: heartValue,
      setValue: setHeartValue,
    },
    {
      id: "logic" as const,
      emoji: "🧠",
      label: "Logic",
      glow: "#5661FF",
      value: logicValue,
      setValue: setLogicValue,
    },
    {
      id: "shadow" as const,
      emoji: "😈",
      label: "Shadow",
      glow: "#8884AD",
      value: shadowValue,
      setValue: setShadowValue,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-debate font-sans">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-pulse-glow">Internal Dialogue</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4">Current Dilemma</h2>
      </div>

      {/* Avatar Cards */}
      <div className="container mx-auto px-4 mb-16">
        <div className="flex justify-center gap-8 flex-wrap">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`
                bg-white/[0.04] backdrop-blur-sm rounded-2xl p-8 cursor-pointer transition-all duration-300 
                hover:scale-105 border-2 animate-float-slow
                ${
                  selectedAvatar === avatar.id
                    ? "border-white/30 shadow-avatar-selected"
                    : "border-white/10 hover:border-white/20"
                }
              `}
              style={{
                boxShadow:
                  selectedAvatar === avatar.id ? `0 0 30px ${avatar.glow}40, 0 0 60px ${avatar.glow}20` : undefined,
              }}
            >
              <div className="text-6xl mb-4 animate-flicker-fast">{avatar.emoji}</div>
              <h3 className="text-white text-xl font-bold">{avatar.label}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Control Sliders */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {avatars.map((avatar) => (
            <div key={avatar.id} className="flex items-center gap-6">
              <div className="flex items-center gap-3 min-w-[120px]">
                <span className="text-3xl">{avatar.emoji}</span>
                <span className="text-white font-semibold text-lg">{avatar.label}</span>
              </div>
              <div className="flex-1">
                <Slider
                  value={avatar.value}
                  onValueChange={avatar.setValue}
                  max={100}
                  step={1}
                  className="slider-custom"
                  style={
                    {
                      "--slider-track": "#FFFFFF",
                      "--slider-bg": "#0B0E1A",
                      "--slider-thumb": avatar.glow,
                    } as React.CSSProperties
                  }
                />
              </div>
              <div className="min-w-[50px] text-right">
                <span className="text-white font-mono text-lg">{avatar.value[0]}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesize Button */}
      <div className="container mx-auto px-4 text-center pb-16">
        <Button
          size="lg"
          className="bg-gradient-synthesis hover:opacity-90 text-white px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
        >
          Synthesize Wisdom
        </Button>
      </div>
    </div>
  )
}
