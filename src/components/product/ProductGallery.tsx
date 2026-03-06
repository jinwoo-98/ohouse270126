"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowIcon } from "lucide-react";
import { cn, getOptimizedImageUrl, formatPrice, generateProductAltText } from "@/lib/utils";

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
    category_id?: string;
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
  onActiveHotspotChange?: (productId: string | null) => void;
  children?: (currentImageUrl: string) => React.ReactNode;
  product?: any; 
  aspectRatio?: string;
  disableZoom?: boolean;
  hideCounter?: boolean;
  showHotspots?: boolean;
  onImageClick?: () => void;
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
  onActiveHotspotChange,
  children, 
  product,
  aspectRatio = "aspect-square",
  disableZoom = false,
  hideCounter = false,
  showHotspots = true,
  onImageClick
}: ProductGalleryProps) {
  const safeGallery = Array.isArray(galleryImages) ? galleryImages : [];
  const allImages = [mainImage || '/placeholder.svg', ...safeGallery].filter(Boolean);
  
  const [[page, direction], setPage] = useState([0, 0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageIndex = page % allImages.length;
  const currentImageUrl = allImages[imageIndex];
  const currentAlt = generateProductAltText(product || { name: productName, id: 'GALLERY', image_alt_text: imageAltText }, imageIndex);

  const paginate = (newDirection: number) => {
    if (allImages.length <= 1) return;
    setIsZoomed(false); 
    setActiveHotspotId(null);
    onActiveHotspotChange?.(null);
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
    if (disableZoom || !isZoomed || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (onImageClick) {
      onImageClick();
      setActiveHotspotId(null);
      onActiveHotspotChange?.(null);
      return;
    }

    if (disableZoom) {
      setActiveHotspotId(null);
      onActiveHotspotChange?.(null);
      return;
    }

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
    <>
      {activeHotspots.map((item) => {
        const isActive = activeHotspotId === item.id;
        
        return (
          <div 
            key={item.id}
            className={cn(
              "absolute z-30 transition-all duration-500",
              (isZoomed || !showHotspots) ? "opacity-0 pointer-events-none scale-0" : "opacity-100"
            )}
            style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
          >
            {/* Nút Hotspot chính - Kích thước 32px (w-8 h-8) */}
            <button
              className="group relative w-8 h-8 -ml-4 -mt-4 rounded-full bg-primary/40 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 z-30"
              onMouseEnter={() => {
                // Cập nhật trạng thái khi di chuột vào
                setActiveHotspotId(item.id);
                onActiveHotspotChange?.(item.product.id);
              }}
              // Loại bỏ onMouseLeave để giữ trạng thái "dính"
            >
              {/* Vòng tròn trắng ở tâm - 12px, thu nhỏ còn 8px khi hover (scale 0.67) */}
              <div className={cn(
                "w-3 h-3 rounded-full bg-white transition-all duration-300",
                isActive ? "scale-[0.67]" : "scale-100"
              )} />
              
              {/* Viền trắng 2px hiện khi đang active */}
              <div className={cn(
                "absolute inset-0 rounded-full border-white transition-all duration-300",
                isActive ? "opacity-100 border-[2px]" : "opacity-0 border-0"
              )} />
            </button>

            {/* Bảng thông tin Popup */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-0 mb-12 flex items-center shadow-elevated rounded-xl overflow-visible z-50 bg-white"
                  style={{ left: '-21px' }} // Mép trái dịch sang trái 21px so với tâm nút
                >
                  {/* Đường nối 1px sắc nét từ tâm nút lên bảng */}
                  <div 
                    className="absolute top-full w-[1px] h-12 bg-white pointer-events-none shadow-sm z-50" 
                    style={{ left: '21px', transform: 'translateX(-50%)' }}
                  />

                  {/* Phần thông tin (143x72px) */}
                  <div className="w-[143px] h-[72px] bg-white p-3 flex flex-col justify-center text-left border-r border-border/40 rounded-l-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate mb-1">
                      {item.product.category_id?.replace(/-/g, ' ') || "Sản phẩm"}
                    </p>
                    <p className="text-sm font-bold text-primary truncate">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Nút Xem nhanh (24x72px) - Nền trắng, icon màu chủ đạo */}
                  <button
                    className="w-[24px] h-[72px] bg-white flex items-center justify-center text-primary hover:bg-primary/5 transition-colors rounded-r-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onHotspotClick) onHotspotClick(item.product);
                    }}
                  >
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
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
                "relative w-16 md:w-full rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white",
                aspectRatio, 
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
          "relative flex-1 bg-white rounded-2xl overflow-hidden border border-border/40 shadow-subtle order-1 md:order-2",
          aspectRatio,
          !disableZoom ? (isZoomed ? "cursor-zoom-out" : "cursor-zoom-in") : "cursor-default"
        )}
        onMouseMove={handleMouseMove}
        onClick={handleContainerClick}
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

        {renderHotspots()}
        
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
        
        {!isZoomed && !hideCounter && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 z-10">
            {imageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
}