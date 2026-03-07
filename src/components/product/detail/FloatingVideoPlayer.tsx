"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Maximize, Loader2 } from "lucide-react";

interface FloatingVideoPlayerProps {
  videoUrl: string;
  onOpenFullScreen: () => void;
  isParentPaused?: boolean;
}

export function FloatingVideoPlayer({ videoUrl, onOpenFullScreen, isParentPaused }: FloatingVideoPlayerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (isParentPaused && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isParentPaused]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setIsLoading(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  };

  const handleContainerTap = () => {
    if (!isDragging.current) {
      onOpenFullScreen();
    }
  };

  if (!isVisible || !videoUrl || videoUrl.trim() === "") return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        drag
        dragMomentum={false}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={() => { setTimeout(() => { isDragging.current = false; }, 100); }}
        initial={{ opacity: 0, scale: 0.5, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.5, x: 100 }}
        className="fixed bottom-72 right-2 md:right-4 z-[140] w-[110px] h-[196px] md:w-[140px] md:h-[248px] rounded-2xl overflow-hidden shadow-elevated cursor-grab active:cursor-grabbing group bg-black border border-white/10"
        onTap={handleContainerTap}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <video
          ref={videoRef}
          src={isIntersecting ? `${videoUrl}#t=0.1` : ""}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-current ml-1" />
            </div>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-destructive transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          onPointerDown={(e) => e.stopPropagation()}
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