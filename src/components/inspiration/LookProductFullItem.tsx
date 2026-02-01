"use client";

import { Link, useNavigate } from "react-router-dom";
import { Eye, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice, cn } from "@/lib/utils";

interface LookProductFullItemProps {
  product: any;
  onQuickView: (product: any) => void;
}

export function LookProductFullItem({ product, onQuickView }: LookProductFullItemProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const isFavorite = isInWishlist(product.id);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/san-pham/${product.slug || product.id}`);
  };

  return (
    <div 
      className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer"
      onClick={handleCardClick} // Click vào toàn bộ thẻ sẽ điều hướng
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30 shrink-0">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
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

        {/* Nút Xem Nhanh (Bottom Left - Vị trí thống nhất) */}
        <div className="absolute bottom-3 left-3 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
            className="h-9 px-4 rounded-xl flex items-center justify-center bg-charcoal/90 backdrop-blur-md text-white hover:bg-primary transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
            title="Xem nhanh"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" /> XEM NHANH
          </button>
        </div>
      </div>
      
      {/* Info Section - Căn giữa, đồng bộ khoảng cách với ProductCard */}
      <div className="p-4 flex flex-col flex-1 items-center text-center pt-4">
        {/* Loại bỏ Link bọc H3 để tránh xung đột click */}
        <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10 flex items-center justify-center mb-2">
          {product.name}
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
          <p className="text-sm md:text-base font-bold text-primary">{formatPrice(product.price)}</p>
          {product.original_price && (
            <span className="text-[10px] md:text-xs text-muted-foreground line-through opacity-50">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}