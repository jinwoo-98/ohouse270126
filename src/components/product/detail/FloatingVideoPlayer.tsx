"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, Maximize } from "lucide-react";

interface FloatingVideoPlayerProps {
  videoUrl: string;
  onOpenFullScreen: () => void;
}

export function FloatingVideoPlayer({ videoUrl, onOpenFullScreen }: FloatingVideoPlayerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: window.innerWidth - 90, top: 0, bottom: window.innerHeight - 160 }}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed bottom-[260px] right-6 z-[110] w-[90px] h-[160px] rounded-2xl overflow-hidden shadow-elevated cursor-grab active:cursor-grabbing group bg-black"
      onClick={onOpenFullScreen}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

      <button
        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
        className="absolute top-1 right-1 w-6 h-6 bg-black/40 text-white/70 rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
      >
        <X className="w-3 h-3" />
      </button>

      <button
        onClick={togglePlay}
        className="absolute bottom-1 left-1 w-6 h-6 bg-black/40 text-white/70 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </button>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize className="w-5 h-5" />
      </div>
    </motion.div>
  );
}