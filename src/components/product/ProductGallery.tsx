import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils"; // Cần formatPrice cho Tooltip

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
  hotspots?: Hotspot[]; // Dữ liệu hotspot (chỉ dùng cho Lookbook)
  onHotspotClick?: (product: any) => void; // Xử lý khi click vào hotspot trong lightbox
  children?: (currentImageUrl: string) => React.ReactNode;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ProductGallery({ mainImage, galleryImages, productName, hotspots = [], onHotspotClick, children }: ProductGalleryProps) {
  const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
  const allImages = [mainImage, ...safeGallery].filter(Boolean);
  
  const [[page, direction], setPage] = useState([0, 0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imageIndex = page % allImages.length;
  const currentImageUrl = allImages[imageIndex];

  const paginate = (newDirection: number) => {
    if (allImages.length <= 1) return;
    let newIndex = imageIndex + newDirection;
    if (newIndex < 0) {
      newIndex = allImages.length - 1;
    } else if (newIndex >= allImages.length) {
      newIndex = 0;
    }
    setPage([newIndex, newDirection]);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };
  
  // Lọc hotspot cho ảnh hiện tại
  const activeHotspots = hotspots.filter(h => h.target_image_url === currentImageUrl);

  // Render Hotspot Overlay (dùng chung cho cả main view và lightbox)
  const renderHotspots = (isLightbox: boolean) => (
    <TooltipProvider>
      {activeHotspots.map((item) => (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-20 group/dot pointer-events-auto",
                isLightbox ? "z-[210]" : "z-20" // Đảm bảo hotspot nằm trên ảnh trong lightbox
              )}
              style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onHotspotClick) onHotspotClick(item.product);
              }}
            >
              {/* Vòng tròn ngoài (Ping effect) */}
              <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
              {/* Vòng tròn trong (Hotspot chính) */}
              <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side={isLightbox ? "bottom" : "top"} className="bg-charcoal text-cream border-none p-3 rounded-xl shadow-elevated">
            <p className="font-bold text-[10px] uppercase tracking-wider">{item.product.name}</p>
            <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.product.price)}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );

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
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
          >
            <img
              src={currentImageUrl}
              alt={productName}
              className="w-full h-full object-cover pointer-events-none"
              draggable="false"
            />
            {/* Lớp phủ trong suốt để nhận sự kiện click mở lightbox mà không ảnh hưởng vuốt */}
            <div 
                className="absolute inset-0 cursor-zoom-in" 
                onClick={() => setIsLightboxOpen(true)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Hotspots cho ảnh chính (nếu có) */}
        {hotspots.length > 0 && renderHotspots(false)}
        
        {/* Children (dùng cho ProductDetailPage) */}
        {typeof children === 'function' && children(currentImageUrl)}

        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-elevated hover:bg-primary hover:text-white transition-all text-charcoal"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {allImages.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-10 flex items-center justify-center group shadow-medium"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-10 flex items-center justify-center group shadow-medium"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
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

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center z-[200] [&>button]:hidden"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setIsLightboxOpen(false)}
              // Tối ưu kích thước: p-2 (mobile) / md:p-3 (desktop)
              className="fixed top-4 right-4 p-2 md:top-6 md:right-6 bg-charcoal/50 text-white rounded-full hover:bg-charcoal transition-colors z-[210]"
            >
              {/* Tối ưu kích thước icon: w-5 h-5 (mobile) / md:w-6 md:h-6 (desktop) */}
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {/* Image Container for Lightbox */}
            <div className="relative">
              <img 
                src={currentImageUrl} 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                alt={productName}
              />
              
              {/* Hotspots Overlay for Lightbox */}
              {hotspots.length > 0 && renderHotspots(true)}
            </div>
            
            {/* Navigation Buttons for Lightbox */}
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-[210] flex items-center justify-center group shadow-medium"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); paginate(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-[210] flex items-center justify-center group shadow-medium"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}