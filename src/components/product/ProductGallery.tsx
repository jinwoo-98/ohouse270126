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
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Main Image Container */}
      <div className="relative group bg-white rounded-[32px] overflow-hidden border border-border/40 shadow-subtle aspect-square">
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
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 }
            }}
            alt={productName}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          />
        </AnimatePresence>

        {/* Overlay Tools */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-elevated hover:bg-primary hover:text-white transition-all text-charcoal group"
          >
            <ZoomIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-medium hover:bg-primary hover:text-white transition-all text-charcoal z-10 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-medium hover:bg-primary hover:text-white transition-all text-charcoal z-10 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* Counter Badge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 z-10">
          {currentIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={cn(
                "relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0",
                currentIndex === idx 
                  ? "border-primary shadow-gold ring-4 ring-primary/10" 
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

            {allImages.length > 1 && (
              <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-6 z-[210]">
                <Button variant="outline" size="icon" onClick={() => paginate(-1)} className="h-12 w-12 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => paginate(1)} className="h-12 w-12 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}