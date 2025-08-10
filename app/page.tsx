"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Component() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dilemmaId, setDilemmaId] = useState(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      alert("Please enter your dilemma")
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/dilemma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Backend error:", errorText)
        throw new Error(`Failed to submit dilemma: ${response.status}`)
      }

      const data = await response.json()
      console.log("Dilemma created successfully:", data)
      setDilemmaId(data.dilemma.id)
      
      // Navigate to debate page with the dilemma ID
      router.push(`/debate?id=${data.dilemma.id}`)
      
    } catch (error) {
      console.error("Error submitting dilemma:", error)
      alert("Failed to submit dilemma. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep font-sans">
      {/* Hero Section with Radial Glow */}
      <div className="bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <div className="space-y-8">
            <p className="text-accent-warm text-sm font-bold tracking-wider uppercase animate-flicker">
              MINI INNER-COUNCIL
            </p>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-sf-bold text-text-base leading-tight animate-glow-pulse">
              Split Yourself Into Stems
            </h1>
            <p className="text-text-sub text-lg md:text-xl max-w-4xl mx-auto leading-relaxed animate-fade-up">
              Let Heart, Logic, and Shadow debate your dilemma in 60 seconds.
            </p>
            <div className="animate-float-in">
              <Button
                size="lg"
                className="bg-gradient-cta hover:opacity-90 text-white px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                onClick={() => router.push("/debate")}
              >
                Start the Debate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Character Cards Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="animate-stagger-1">
              <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:bg-white/[0.1] hover:scale-105 hover:shadow-glass text-center shadow-glass">
                <div className="text-5xl mb-6">❤️</div>
                <h3 className="text-text-base text-xl font-bold mb-4">Heart</h3>
                <p className="text-text-sub leading-relaxed">Pure feelings & intuition.</p>
              </div>
            </div>

            <div className="animate-stagger-2">
              <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:bg-white/[0.1] hover:scale-105 hover:shadow-glass text-center shadow-glass">
                <div className="text-5xl mb-6">🧠</div>
                <h3 className="text-text-base text-xl font-bold mb-4">Logic</h3>
                <p className="text-text-sub leading-relaxed">Facts, pros, and cons.</p>
              </div>
            </div>

            <div className="animate-stagger-3">
              <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:bg-white/[0.1] hover:scale-105 hover:shadow-glass text-center shadow-glass">
                <div className="text-5xl mb-6">😈</div>
                <h3 className="text-text-base text-xl font-bold mb-4">Shadow</h3>
                <p className="text-text-sub leading-relaxed">Hidden fears & worst-cases.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section with Glow Background */}
      <div className="bg-gradient-form py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-text-base text-4xl md:text-5xl font-bold animate-fade-up">{"What's your dilemma?"}</h2>

            <div className="animate-fade-up">
              <Textarea
                placeholder="e.g. I'm torn between taking a gap year to travel or accepting an internship. What should I do?"
                className="bg-white/[0.07] backdrop-blur-sm border-white/20 text-text-base placeholder:text-text-sub/70 min-h-[160px] text-lg p-8 rounded-2xl resize-none focus:bg-white/[0.1] focus:border-accent-warm/50 focus:ring-2 focus:ring-accent-warm/20 transition-all duration-300 shadow-glow"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="text-left max-w-4xl mx-auto space-y-3 animate-fade-up">
              <p className="text-accent-warm italic">
                <span className="font-bold not-italic">*Tip:*</span>{" "}
                <span className="italic">
                  add context, options, and what matters to you most for the clearest guidance.
                </span>
              </p>
              <p className="text-text-sub text-sm">"Your input is processed in-browser and cleared on refresh."</p>
            </div>

            <div className="animate-float-in">
              <Button
                size="lg"
                className="bg-gradient-cta hover:opacity-90 text-white px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Let Them Talk"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-steps py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-text-base text-4xl md:text-5xl font-bold mb-20">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            <div className="text-center animate-stagger-1">
              <div className="text-accent-warm text-4xl font-bold mb-6">1</div>
              <h3 className="text-text-base text-2xl font-bold mb-6">Listen</h3>
              <p className="text-text-sub text-lg leading-relaxed">Animated avatars speak their minds.</p>
            </div>

            <div className="text-center animate-stagger-2">
              <div className="text-accent-warm text-4xl font-bold mb-6">2</div>
              <h3 className="text-text-base text-2xl font-bold mb-6">Control the Scene</h3>
              <p className="text-text-sub text-lg leading-relaxed">Use sliders to balance the conversation.</p>
            </div>

            <div className="text-center animate-stagger-3">
              <div className="text-accent-warm text-4xl font-bold mb-6">3</div>
              <h3 className="text-text-base text-2xl font-bold mb-6">Synthesize</h3>
              <p className="text-text-sub text-lg leading-relaxed">Get a balanced recommendation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-bg-deep py-12 border-t border-white/10">
        <div className="container mx-auto px-4 animate-fade-up">
          <div className="flex justify-center space-x-8 mb-6">
            <a href="https://github.com/kalkidantw/split-yourself-stems" target="_blank" rel="noopener noreferrer" className="text-text-sub hover:text-text-base transition-colors duration-300 font-medium">
              GitHub
            </a>
            <a href="#" className="text-text-sub hover:text-text-base transition-colors duration-300 font-medium">
              Privacy
            </a>
          </div>
          <p className="text-text-sub text-center text-sm">@2025 Mini Inner-Council : Split Yourself Into Stems. Kalkidan Wubshett</p>
        </div>
      </footer>
    </div>
  )
}
