import Image from "next/image"
import { useEffect, useState, useRef } from "react"

const ShadowAvatar = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const [frameIndex, setFrameIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const totalFrames = 8
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevSpeakingRef = useRef<boolean>(false);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isSpeaking) {
      // Start animation when speaking begins
      console.log('😈 Shadow avatar: Starting animation, frame 1');
      setFrameIndex(0); // Ensure we start from frame 1
      
      intervalRef.current = setInterval(() => {
        setFrameIndex((prevIndex) => {
          const next = (prevIndex + 1) % totalFrames;
          return next;
        });
      }, 200); // 200ms per frame for smooth animation
    } else {
      // Reset to frame 1 when not speaking
      if (prevSpeakingRef.current) { // Only log if we were previously speaking
        console.log('😈 Shadow avatar: Stopping animation, resetting to frame 1');
      }
      setFrameIndex(0);
    }

    // Update previous speaking state
    prevSpeakingRef.current = isSpeaking;

    // Cleanup interval on unmount or when isSpeaking changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSpeaking])

  if (imageError) {
    return (
      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl bg-purple-600">
        😈
      </div>
    )
  }

  return (
    <Image
      src={`/avatars/shadow/frame${frameIndex + 1}.png`}
      alt="Shadow Avatar"
      width={1000}
      height={1000}
      priority
      className="w-full h-full rounded-2xl transition-opacity duration-300 object-cover"
      style={{ 
        minWidth: '100%',
        minHeight: '100%',
        maxWidth: 'none',
        maxHeight: 'none'
      }}
      onError={() => setImageError(true)}
    />
  )
}

export default ShadowAvatar
