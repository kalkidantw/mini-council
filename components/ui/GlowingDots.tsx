'use client';

interface GlowingDotsProps {
  value: number; // 0-100
  personaColor: string;
  personaGlowColor: string;
  isActive: boolean;
  onValueChange: (value: number) => void;
}

export default function GlowingDots({ value, personaColor, personaGlowColor, isActive, onValueChange }: GlowingDotsProps) {
  // Calculate how many dots should glow based on percentage
  const activeDots = Math.ceil((value / 100) * 4);
  
  // Generate percentage text
  const percentageText = `${Math.round(value)}%`;
  
  // Handle dot click to adjust participation level
  const handleDotClick = (dotIndex: number) => {
    const newValue = (dotIndex + 1) * 25; // 25%, 50%, 75%, 100%
    onValueChange(newValue);
  };
  
  // Create array of 4 dots
  const dots = Array.from({ length: 4 }, (_, index) => {
    const isGlowing = index < activeDots;
    return (
      <button
        key={index}
        onClick={() => handleDotClick(index)}
        className={`w-3 h-3 rounded-full transition-all duration-500 cursor-pointer hover:scale-125 ${
          isGlowing ? 'scale-110' : 'scale-75 opacity-30'
        }`}
        style={{
          background: isGlowing 
            ? `radial-gradient(circle, ${personaColor} 0%, ${personaColor}40 50%, transparent 100%)`
            : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isGlowing 
            ? `0 0 12px ${personaGlowColor}60, 0 0 24px ${personaGlowColor}30, inset 0 1px 0 rgba(255,255,255,0.3)`
            : 'none',
          filter: isGlowing ? 'blur(0.5px)' : 'none',
        }}
        aria-label={`Set participation to ${(index + 1) * 25}%`}
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Glowing Dots */}
      <div className="flex items-center gap-2">
        {dots}
      </div>
      
      {/* Percentage Text */}
      <span 
        className={`text-sm font-sf-medium transition-all duration-300 ${
          isActive ? 'text-animated-text-main' : 'text-animated-text-dim'
        }`}
        style={{
          color: isActive ? personaColor : undefined,
          textShadow: isActive ? `0 0 8px ${personaGlowColor}40` : 'none',
        }}
      >
        {percentageText}
      </span>
    </div>
  );
} 