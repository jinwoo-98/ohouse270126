"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  mainImage: string;
  galleryImages?: string[] | null;
  productName: string;
}

export function ProductGallery({ mainImage, galleryImages, productName }: ProductGalleryProps) {
  // Xử lý an toàn: Chuyển galleryImages thành mảng rỗng nếu là null/undefined
  const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
  
  // Gộp ảnh chính và ảnh phụ thành 1 mảng
  const allImages = [mainImage, ...safeGallery].filter(Boolean);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Logic Zoom
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${allImages[currentIndex]})`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % allImages.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative group">
        <div 
          ref={containerRef}
          className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-border shadow-subtle cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsLightboxOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={allImages[currentIndex]}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Zoom Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 bg-no-repeat bg-[length:250%]"
            style={zoomStyle}
          />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-primary hover:text-white transition-all"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Arrows */}
          {allImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                currentIndex === idx ? "border-primary shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} alt={`${productName} thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="fixed top-6 right-6 p-3 bg-charcoal/50 text-white rounded-full hover:bg-charcoal transition-colors z-[160]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img 
              src={allImages[currentIndex]} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-elevated"
              alt={productName}
            />

            {allImages.length > 1 && (
              <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-4 z-[160]">
                <Button variant="outline" size="icon" onClick={goToPrev} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="px-4 py-2 bg-charcoal/50 text-white rounded-full text-xs font-bold tracking-widest backdrop-blur-md">
                  {currentIndex + 1} / {allImages.length}
                </div>
                <Button variant="outline" size="icon" onClick={goToNext} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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