"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { QuickViewSheet } from "./QuickViewSheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardProps {
  product: any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [activeImage, setActiveImage] = useState(product.image_url);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const isFavorite = isInWishlist(product.id);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetSlug = product.slug || product.id;
    
    // Trên Mobile, click vào thẻ sẽ mở QuickView
    if (isMobile) {
      setIsQuickViewOpen(true);
    } else {
      // Desktop: Chuyển hướng đến trang chi tiết
      navigate(`/san-pham/${targetSlug}`);
    }
  };

  return (
    <>
      <motion.div 
        layout
        className={cn(
          "group flex flex-col bg-transparent rounded-2xl overflow-hidden transition-all duration-500 hover:bg-card hover:shadow-elevated h-full border border-transparent hover:border-border/40 cursor-pointer", 
          className
        )}
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-secondary/15 shrink-0 rounded-2xl">
          <div className="block h-full w-full">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                src={activeImage} 
                alt={product.name} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
            </AnimatePresence>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.is_sale && (
              <span className="bg-destructive text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm rounded-sm">Sale</span>
            )}
            {product.is_new && (
              <span className="bg-primary text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm rounded-sm">New</span>
            )}
          </div>

          {/* Vertical Action Buttons (Top Right) - CHỈ GIỮ LẠI NÚT YÊU THÍCH */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 transform translate-x-2 md:group-hover:translate-x-0">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                toggleWishlist({ ...product, slug: product.slug }); 
              }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm",
                isFavorite 
                  ? "bg-primary text-white" 
                  : "bg-white/80 text-charcoal hover:bg-primary hover:text-white"
              )}
              title="Yêu thích"
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>
          </div>
          
          {/* Nút Xem Nhanh (Bottom Left - ẨN TRÊN MOBILE) */}
          {!isMobile && (
            <div className="absolute bottom-3 left-3 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsQuickViewOpen(true); }}
                className="h-9 px-4 rounded-xl flex items-center justify-center bg-charcoal/90 backdrop-blur-md text-white hover:bg-primary transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
                title="Xem nhanh"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" /> XEM NHANH
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 flex flex-col items-center text-center flex-1 pt-4">
          {/* Link này chỉ để đảm bảo SEO và hover style, click chính được xử lý ở div cha */}
          <Link to={`/san-pham/${product.slug || product.id}`} onClick={(e) => e.preventDefault()}>
            <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10 flex items-center justify-center mb-2">
              {product.name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
            <span className="text-sm md:text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-[10px] md:text-xs text-muted-foreground line-through opacity-50">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <QuickViewSheet 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}