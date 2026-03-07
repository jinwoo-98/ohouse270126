"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Maximize, Loader2 } from "lucide-react";

interface FloatingVideoPlayerProps {
  videoUrl: string;
  onOpenFullScreen: () => void;
}

export function FloatingVideoPlayer({ videoUrl, onOpenFullScreen }: FloatingVideoPlayerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      setIsLoading(true);
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoUrl]);

  const togglePlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  if (!isVisible || !videoUrl || videoUrl.trim() === "") return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={() => { setTimeout(() => { isDragging.current = false; }, 100); }}
        initial={{ opacity: 0, scale: 0.5, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.5, x: 100 }}
        className="fixed bottom-72 right-2 md:right-4 z-[140] w-[110px] h-[196px] md:w-[140px] md:h-[248px] rounded-2xl overflow-hidden shadow-elevated cursor-grab active:cursor-grabbing group bg-black border border-white/10"
        onTap={() => { if (!isDragging.current) onOpenFullScreen(); }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <video
          key={videoUrl}
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
          onCanPlay={() => setIsLoading(false)}
          onError={() => setIsVisible(false)}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        <button
          onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-destructive transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="absolute bottom-2 left-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-primary transition-all z-20"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-primary/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-gold z-10">
          <Maximize className="w-6 h-6" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}