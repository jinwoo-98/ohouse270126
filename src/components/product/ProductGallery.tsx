import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductGalleryProps {
  mainImage: string;
  galleryImages?: string[] | null;
  productName: string;
  children?: (currentImageUrl: string) => React.ReactNode;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ProductGallery({ mainImage, galleryImages, productName, children }: ProductGalleryProps) {
  const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
  const allImages = [mainImage, ...safeGallery].filter(Boolean);
  
  const [[page, direction], setPage] = useState([0, 0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imageIndex = page % allImages.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 select-none">
      <div className="relative w-full aspect-square bg-white rounded-2xl md:rounded-[32px] overflow-hidden border border-border/40 shadow-subtle group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
          >
            <img
              src={allImages[imageIndex]}
              alt={productName}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            />
          </motion.div>
        </AnimatePresence>

        {typeof children === 'function' && children(allImages[imageIndex])}

        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-elevated hover:bg-primary hover:text-white transition-all text-charcoal"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {allImages.length > 1 && (
          <div className="hidden sm:block">
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-10 flex items-center justify-center group shadow-medium"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-10 flex items-center justify-center group shadow-medium"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 z-10">
          {imageIndex + 1} / {allImages.length}
        </div>
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 w-full">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPage([idx, idx > imageIndex ? 1 : -1]);
              }}
              className={cn(
                "relative w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white",
                imageIndex === idx 
                  ? "border-primary ring-2 ring-primary/10" 
                  : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

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
              src={allImages[imageIndex]} 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              alt={productName}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}