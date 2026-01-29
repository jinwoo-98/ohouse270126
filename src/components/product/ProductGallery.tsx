"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  mainImage: string;
  galleryImages?: string[] | null;
  productName: string;
}

export function ProductGallery({ mainImage, galleryImages, productName }: ProductGalleryProps) {
  const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
  const allImages = [mainImage, ...safeGallery].filter(Boolean);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "20%" : "-20%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "20%" : "-20%",
      opacity: 0,
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-4 select-none w-full max-w-full overflow-hidden">
      {/* Main Image Container - Force 1:1 ratio and strict width constraints */}
      <div className="relative group bg-white rounded-2xl md:rounded-[32px] overflow-hidden border border-border/40 shadow-subtle aspect-square w-full max-w-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            src={allImages[currentIndex]}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            alt={productName}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          />
        </AnimatePresence>

        {/* Overlay Tools */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-elevated hover:bg-primary hover:text-white transition-all text-charcoal group"
          >
            <ZoomIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <div className="hidden sm:block">
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-medium hover:bg-primary hover:text-white transition-all text-charcoal z-10 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-medium hover:bg-primary hover:text-white transition-all text-charcoal z-10 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Counter Badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 z-10">
          {currentIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 w-full max-w-full">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={cn(
                "relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white",
                currentIndex === idx 
                  ? "border-primary ring-2 ring-primary/10 shadow-sm" 
                  : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center z-[200]">
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="fixed top-6 right-6 p-3 bg-charcoal/50 text-white rounded-full hover:bg-charcoal transition-colors z-[210]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img 
              src={allImages[currentIndex]} 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              alt={productName}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}