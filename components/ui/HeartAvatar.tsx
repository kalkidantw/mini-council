'use client';
import { useEffect, useState, useRef } from 'react';

const frames = [
    '/avatars/heart/frame1.png',
    '/avatars/heart/frame2.png',
    '/avatars/heart/frame3.png',
    '/avatars/heart/frame4.png',
    '/avatars/heart/frame5.png',
    '/avatars/heart/frame6.png',
    '/avatars/heart/frame7.png',
    '/avatars/heart/frame8.png',
  ];
  

export default function HeartAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
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
      console.log('❤️ Heart avatar: Starting animation, frame 1');
      setFrameIndex(0); // Ensure we start from frame 1
      
      intervalRef.current = setInterval(() => {
        setFrameIndex((prev) => {
          const next = (prev + 1) % frames.length;
          return next;
        });
      }, 200); // 200ms per frame for smooth animation
    } else {
      // Reset to frame 1 when not speaking
      if (prevSpeakingRef.current) { // Only log if we were previously speaking
        console.log('❤️ Heart avatar: Stopping animation, resetting to frame 1');
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
  }, [isSpeaking]);

  if (imageError) {
    return (
      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl bg-red-500">
        ❤️
      </div>
    );
  }

  return (
    <img
      src={frames[frameIndex]}
      alt="Heart avatar speaking"
      className="w-full h-full rounded-2xl transition-opacity duration-300 object-cover"
      style={{ 
        minWidth: '100%',
        minHeight: '100%',
        maxWidth: 'none',
        maxHeight: 'none'
      }}
      onError={() => setImageError(true)}
    />
  );
}
