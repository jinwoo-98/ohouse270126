"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { QuickViewSheet } from "./QuickViewSheet";

interface ProductCardProps {
  product: any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [activeImage, setActiveImage] = useState(product.image_url);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const isFavorite = isInWishlist(product.id);
  const gallery = [product.image_url, ...(product.gallery_urls || [])].slice(0, 4);

  return (
    <>
      <motion.div 
        layout
        className={cn(
          "group flex flex-col bg-transparent rounded-[24px] overflow-hidden transition-all duration-500 hover:bg-card hover:shadow-medium h-full", 
          className
        )}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-secondary/20 shrink-0">
          <Link to={`/san-pham/${product.slug || product.id}`} className="block h-full w-full">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                src={activeImage} 
                alt={product.name} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </AnimatePresence>
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.is_sale && (
              <span className="bg-white text-charcoal px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm">Sale</span>
            )}
            {product.is_new && (
              <span className="bg-primary text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm">New</span>
            )}
          </div>

          {/* Vertical Action Buttons (Top Right) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm",
                isFavorite 
                  ? "bg-primary text-white" 
                  : "bg-white text-charcoal hover:bg-primary hover:text-white"
              )}
              title="Yêu thích"
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); addToCart({ ...product, quantity: 1, image: product.image_url }); }}
              className="w-9 h-9 rounded-full bg-white text-charcoal hover:bg-primary hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Thêm vào giỏ"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>

          {/* Quick View Button (Bottom Left) */}
          <button 
            onClick={(e) => { e.preventDefault(); setIsQuickViewOpen(true); }}
            className="absolute bottom-3 left-3 z-20 bg-charcoal/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/20 hover:bg-primary transition-all shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            XEM NHANH
          </button>
        </div>

        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div className="flex justify-center gap-1.5 px-3 py-2 shrink-0">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveImage(img)}
                className={cn(
                  "w-8 h-8 rounded-md overflow-hidden border-2 transition-all",
                  activeImage === img ? "border-primary ring-2 ring-primary/10" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="p-4 flex flex-col items-center text-center flex-1">
          <Link to={`/san-pham/${product.slug || product.id}`} className="block mb-2">
            <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2">
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