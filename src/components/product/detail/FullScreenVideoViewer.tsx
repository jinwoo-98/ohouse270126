"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FullScreenVideoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function FullScreenVideoViewer({ isOpen, onClose, videoUrl }: FullScreenVideoViewerProps) {
  // Chỉ render khi mở và có URL hợp lệ
  const shouldRender = isOpen && videoUrl && videoUrl.trim() !== "";

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[200] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative h-full w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={videoUrl} // Buộc tạo lại phần tử video khi URL thay đổi
              src={videoUrl}
              className="h-full w-auto max-w-full object-contain shadow-2xl"
              controls
              autoPlay
              playsInline
              onError={() => {
                console.error("Full screen video failed to load:", videoUrl);
                onClose();
              }}
            />
            
            {/* Nút đóng nằm ở góc trên bên phải màn hình */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[210] backdrop-blur-md border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}