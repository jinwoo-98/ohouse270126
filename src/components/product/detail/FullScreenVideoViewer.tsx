"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FullScreenVideoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function FullScreenVideoViewer({ isOpen, onClose, videoUrl }: FullScreenVideoViewerProps) {
  return (
    <AnimatePresence>
      {isOpen && videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-full max-w-[450px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          </motion.div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}