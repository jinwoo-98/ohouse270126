"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Maximize } from "lucide-react";

interface FloatingVideoPlayerProps {
  videoUrl: string;
  onOpenFullScreen: () => void;
}

export function FloatingVideoPlayer({ videoUrl, onOpenFullScreen }: FloatingVideoPlayerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Đảm bảo video luôn phát khi component mount
  useEffect(() => {
    if (videoRef.current && videoUrl) {
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

  // Không hiển thị nếu bị ẩn hoặc URL rỗng
  if (!isVisible || !videoUrl || videoUrl.trim() === "") return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.5, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.5, x: 100 }}
        className="fixed bottom-72 right-2 md:right-4 z-[140] w-[100px] h-[178px] md:w-[130px] md:h-[231px] rounded-2xl overflow-hidden shadow-elevated cursor-grab active:cursor-grabbing group bg-black border border-white/10"
        // Sử dụng onTap thay vì onClick để tránh kích hoạt khi đang kéo thả
        onTap={() => onOpenFullScreen()}
      >
        <video
          key={videoUrl}
          ref={videoRef}
          src={`${videoUrl}#t=0.001`}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
          preload="auto"
          onError={(e) => {
            console.warn("Floating video failed to load:", videoUrl);
            setIsVisible(false);
          }}
        />
        
        {/* Overlay gradient để các nút dễ nhìn hơn */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        {/* Nút đóng */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-destructive transition-all z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Nút Play/Pause */}
        <button
          onClick={togglePlay}
          className="absolute bottom-2 left-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-primary transition-all z-10"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
        
        {/* Icon Maximize hiện khi hover */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-primary/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-gold">
          <Maximize className="w-5 h-5" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}