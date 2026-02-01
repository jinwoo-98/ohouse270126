"use client";

import { Link } from "react-router-dom";
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
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...product, quantity: 1, image: product.image_url });
  };
  
  return (
    <div 
      className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer"
    >
      {/* Image Section */}
      <Link to={`/san-pham/${product.slug || product.id}`} className="relative aspect-square overflow-hidden bg-secondary/30 shrink-0">
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

        {/* Nút Xem Nhanh trên ảnh (Overlay) */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
            className="bg-white text-charcoal p-2 rounded-full shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </Link>
      
      {/* Info Section (Có tên và nút thêm giỏ) */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/san-pham/${product.slug || product.id}`}>
          <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-primary font-bold text-sm leading-none">{formatPrice(product.price)}</p>
          <Button 
            size="sm" 
            className="h-8 w-8 rounded-full p-0 bg-charcoal text-white hover:bg-primary transition-colors"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}