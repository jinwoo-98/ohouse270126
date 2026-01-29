"use client";

import { Link } from "react-router-dom";
import { Heart, Eye, Star, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: any;
  onQuickView?: (product: any) => void;
  className?: string;
}

export function ProductCard({ product, onQuickView, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const rating = product.fake_rating || 5;
  const reviews = product.fake_review_count || 0;
  const sold = product.fake_sold || 0;

  return (
    <motion.div 
      layout
      className={cn("group flex flex-col h-full bg-card rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-medium border border-border/40", className)}
    >
      {/* Image Section - Fixed 1:1 Ratio */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
        <Link to={`/san-pham/${product.slug || product.id}`} className="block h-full w-full">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_sale && (
            <span className="bg-white text-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Sale
            </span>
          )}
          {product.is_new && (
            <span className="bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button 
            onClick={() => toggleWishlist({ ...product, image: product.image_url })}
            className={cn(
              "p-2.5 rounded-full shadow-medium transition-colors",
              isFavorite ? "bg-primary text-white" : "bg-white/90 backdrop-blur-sm text-charcoal hover:bg-primary hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
          
          {onQuickView && (
            <button 
              onClick={() => onQuickView(product)}
              className="p-2.5 bg-white/90 backdrop-blur-sm text-charcoal rounded-full shadow-medium hover:bg-primary hover:text-white transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image_url,
              quantity: 1,
              slug: product.slug
            })}
            className="w-full btn-hero h-11 py-0 rounded-xl text-[10px] font-bold shadow-gold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> THÊM VÀO GIỎ
          </button>
        </div>
      </div>

      {/* Info Section - Centered content */}
      <div className="p-4 md:p-5 flex-1 flex flex-col items-center text-center">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-3 h-3", i < Math.floor(rating) ? "fill-current" : "text-gray-200")} />
            ))}
          </div>
          {reviews > 0 && <span className="text-[10px] text-muted-foreground ml-1">({reviews})</span>}
        </div>

        {/* Name */}
        <Link to={`/san-pham/${product.slug || product.id}`} className="block mb-2">
          <h3 className="text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-tight h-10 overflow-hidden">
            {product.name}
          </h3>
        </Link>

        {/* Price Group */}
        <div className="mt-auto space-y-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through opacity-60">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          
          {/* Sold Stats */}
          {sold > 0 && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Đã bán {sold}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}