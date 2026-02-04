"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCarouselItemProps {
  product: any;
  onQuickView: (product: any) => void;
}

export function ProductCarouselItem({ product, onQuickView }: ProductCarouselItemProps) {
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...product, quantity: 1, image: product.image_url });
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMobile) {
      // Trên Mobile, click vào thẻ sẽ mở QuickView
      onQuickView(product);
    } else {
      // Desktop: Chuyển hướng đến trang chi tiết
      window.location.href = `/san-pham/${product.slug || product.id}`;
    }
  };

  return (
    <div 
      className="group flex flex-col bg-card rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-medium h-full border border-border/40 cursor-pointer"
      onClick={handleCardClick} // Xử lý click chung
    >
      {/* Image Section */}
      <Link to={`/san-pham/${product.slug || product.id}`} onClick={(e) => isMobile && e.preventDefault()} className="relative aspect-square overflow-hidden bg-secondary/15 shrink-0 rounded-t-2xl">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_sale && (
            <span className="bg-destructive text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm rounded-sm">Sale</span>
          )}
          {product.is_new && (
            <span className="bg-primary text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm rounded-sm">New</span>
          )}
        </div>

        {/* Nút Yêu thích (Top Right) */}
        <button 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            toggleWishlist({ ...product, slug: product.slug }); 
          }}
          className={cn(
            "absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm",
            isFavorite 
              ? "bg-primary text-white" 
              : "bg-white/80 text-charcoal hover:bg-primary hover:text-white"
          )}
          title="Yêu thích"
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>

        {/* Nút Xem Nhanh (Bottom Left - ẨN TRÊN MOBILE) */}
        {!isMobile && (
          <div className="absolute bottom-3 left-3 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-charcoal/90 backdrop-blur-md text-white hover:bg-primary transition-all shadow-lg"
              title="Xem nhanh"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      </Link>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1 pt-4">
        <Link to={`/san-pham/${product.slug || product.id}`}>
          <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10 mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm md:text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-[10px] md:text-xs text-muted-foreground line-through opacity-50">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          
          {/* ẨN NÚT THÊM VÀO GIỎ HÀNG TRÊN MOBILE */}
          <div className={cn("flex items-center gap-1", isMobile && "hidden")}>
            <button 
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-charcoal text-white hover:bg-primary transition-colors"
              title="Thêm vào giỏ"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}