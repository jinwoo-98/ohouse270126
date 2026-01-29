"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from "lucide-react";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % allImages.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="space-y-4 select-none">
      {/* Main Image Container */}
      <div className="relative group bg-white rounded-2xl overflow-hidden border border-border shadow-subtle">
        <div className="aspect-square relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={allImages[currentIndex]}
              alt={productName}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            />
          </AnimatePresence>

          {/* Action Buttons - Always visible on mobile, visible on group hover for desktop */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-primary hover:text-white transition-all text-charcoal"
              title="Phóng to ảnh"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Arrows - Always visible with better contrast */}
          {allImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-medium hover:bg-white hover:text-primary transition-all text-charcoal border border-black/5"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-medium hover:bg-white hover:text-primary transition-all text-charcoal border border-black/5"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto custom-scrollbar py-2 px-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                currentIndex === idx ? "border-primary shadow-md ring-1 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
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
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              alt={productName}
            />

            {allImages.length > 1 && (
              <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-6 z-[210]">
                <Button variant="outline" size="icon" onClick={goToPrev} className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext} className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
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