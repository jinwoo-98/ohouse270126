"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getOptimizedImageUrl, formatPrice, generateProductAltText } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Hotspot {
  id: string;
  x_position: number;
  y_position: number;
  product: {
    name: string;
    price: number;
    image_url: string;
    id: string;
    slug: string;
  };
  target_image_url: string;
}

interface ProductGalleryProps {
  mainImage: string;
  galleryImages?: string[] | null;
  productName: string;
  imageAltText?: string; 
  hotspots?: Hotspot[];
  onHotspotClick?: (product: any) => void;
  children?: (currentImageUrl: string) => React.ReactNode;
  product?: any; 
  aspectRatio?: string;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ProductGallery({ 
  mainImage, 
  galleryImages, 
  productName, 
  imageAltText, 
  hotspots = [], 
  onHotspotClick, 
  children, 
  product,
  aspectRatio = "aspect-square"
}: ProductGalleryProps) {
  const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
  const allImages = [mainImage || '/placeholder.svg', ...safeGallery].filter(Boolean);
  
  const [[page, direction], setPage] = useState([0, 0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const imageIndex = page % allImages.length;
  const currentImageUrl = allImages[imageIndex];

  const currentAlt = generateProductAltText(product || { name: productName, id: 'GALLERY', image_alt_text: imageAltText }, imageIndex);

  const paginate = (newDirection: number) => {
    if (allImages.length <= 1) return;
    setIsZoomed(false); 
    let newIndex = imageIndex + newDirection;
    if (newIndex < 0) {
      newIndex = allImages.length - 1;
    } else if (newIndex >= allImages.length) {
      newIndex = 0;
    }
    setPage([newIndex, newDirection]);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    if (isZoomed) return; 
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPos({ x, y });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isZoomed && containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPos({ x, y });
    }
    setIsZoomed(!isZoomed);
  };
  
  const activeHotspots = hotspots.filter(h => h.target_image_url === currentImageUrl);

  const renderHotspots = () => (
    <TooltipProvider>
      {activeHotspots.map((item) => (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-20 group/dot pointer-events-auto",
                isZoomed && "opacity-0 pointer-events-none" 
              )}
              style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onHotspotClick) onHotspotClick(item.product);
              }}
            >
              <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
              <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
            </button>
          </TooltipTrigger>
          {item.product && (
            <TooltipContent side="top" className="bg-charcoal text-cream border-none p-3 rounded-xl shadow-elevated">
              <p className="font-bold text-[10px] uppercase tracking-wider">{item.product.name}</p>
              <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.product.price)}</p>
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </TooltipProvider>
  );

  return (
    <div className="w-full max-w-full select-none flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar order-2 md:order-1 w-full md:w-20 lg:w-24 shrink-0 py-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPage([idx, idx > imageIndex ? 1 : -1]);
              }}
              className={cn(
                "relative aspect-square w-16 md:w-full rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white",
                imageIndex === idx 
                  ? "border-primary ring-2 ring-primary/10" 
                  : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <img 
                src={getOptimizedImageUrl(img, { width: 150 })} 
                alt={generateProductAltText(product || { name: productName, id: 'THUMB' }, idx)} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = img; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className={cn(
          "relative flex-1 bg-white rounded-2xl overflow-hidden border border-border/40 shadow-subtle group order-1 md:order-2",
          aspectRatio,
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onMouseMove={handleMouseMove}
        onClick={toggleZoom}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full"
            drag={isZoomed ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
          >
            <img
              src={getOptimizedImageUrl(currentImageUrl, { width: 1200 })} 
              alt={currentAlt}
              className={cn(
                "w-full h-full object-cover pointer-events-none transition-transform duration-200 ease-out",
                isZoomed ? "scale-[2.5]" : "scale-100"
              )}
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
              draggable="false"
              loading={imageIndex === 0 ? "eager" : "lazy"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = currentImageUrl;
              }}
            />
          </motion.div>
        </AnimatePresence>

        {!isZoomed && hotspots.length > 0 && renderHotspots()}
        
        {typeof children === 'function' && children(currentImageUrl)}

        {allImages.length > 1 && !isZoomed && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/80 backdrop-blur-md rounded-r-xl text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-10 flex items-center justify-center group shadow-medium md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/80 backdrop-blur-md rounded-l-xl text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-10 flex items-center justify-center group shadow-medium md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
        
        {!isZoomed && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 z-10">
            {imageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
}