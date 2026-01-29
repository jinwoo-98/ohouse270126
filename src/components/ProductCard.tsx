"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, Star, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: any;
  onQuickView?: (product: any) => void;
  className?: string;
}

export function ProductCard({ product, onQuickView, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Quản lý ảnh đang hiển thị
  const [activeImage, setActiveImage] = useState(product.image_url);
  const isFavorite = isInWishlist(product.id);
  
  // Lấy danh sách ảnh để hiển thị thumbnails (tối đa 4 ảnh để gọn gàng)
  const gallery = [product.image_url, ...(product.gallery_urls || [])].slice(0, 4);

  return (
    <motion.div 
      layout
      className={cn("group flex flex-col h-full bg-card rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-medium border border-border/40", className)}
    >
      {/* 1. Image Section */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
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

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20">
          <button 
            onClick={() => toggleWishlist({ ...product, image: product.image_url })}
            className={cn(
              "p-2.5 rounded-full shadow-medium transition-all duration-300",
              isFavorite ? "bg-primary text-white scale-110" : "bg-white/90 backdrop-blur-sm text-charcoal hover:bg-primary hover:text-white opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-current")} />
          </button>
        </div>

        {/* Quick Add Overlay */}
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
            className="w-full btn-hero h-10 py-0 rounded-xl text-[9px] font-bold shadow-gold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3 h-3" /> MUA NGAY
          </button>
        </div>
      </div>

      {/* 2. Thumbnails Section - Cho phép xem nhanh các ảnh phụ */}
      {gallery.length > 1 && (
        <div className="flex justify-center gap-1.5 px-3 py-2 border-b border-border/20">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setActiveImage(img)}
              onClick={() => setActiveImage(img)}
              className={cn(
                "w-8 h-8 rounded-md overflow-hidden border transition-all",
                activeImage === img ? "border-primary ring-2 ring-primary/10" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}

      {/* 3. Info Section - Name then Price */}
      <div className="p-4 flex-1 flex flex-col items-center text-center">
        {/* Rating & Sold Small Stats */}
        <div className="flex items-center gap-3 mb-2 opacity-60">
           <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-2.5 h-2.5", i < Math.floor(product.fake_rating || 5) ? "fill-current" : "text-gray-200")} />
            ))}
          </div>
          {product.fake_sold > 0 && <span className="text-[8px] font-bold uppercase tracking-wider">Đã bán {product.fake_sold}</span>}
        </div>

        {/* Tên sản phẩm - Đặt lên hàng đầu */}
        <Link to={`/san-pham/${product.slug || product.id}`} className="block mb-3">
          <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-8 md:h-10">
            {product.name}
          </h3>
        </Link>

        {/* Giá sản phẩm - Đặt ở cuối cùng */}
        <div className="mt-auto w-full">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm md:text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-[10px] md:text-xs text-muted-foreground line-through opacity-50">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}