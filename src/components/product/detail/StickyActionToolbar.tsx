"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface StickyActionToolbarProps {
  product: any;
}

export function StickyActionToolbar({ product }: StickyActionToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      // Hiện thanh khi cuộn qua 800px (thường là qua phần gallery)
      setIsVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border/60 z-[100] transition-all duration-500 transform",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="container-luxury h-20 md:h-24 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden hidden sm:block border shrink-0">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-charcoal truncate max-w-[200px] md:max-w-md">{product.name}</h4>
            <p className="text-primary font-bold text-lg">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleWishlist(product)}
            className={cn(
              "p-3 rounded-xl border-2 transition-all",
              isInWishlist(product.id) ? "bg-primary/5 border-primary text-primary" : "border-border hover:border-primary/40"
            )}
          >
            <Heart className={cn("w-5 h-5", isInWishlist(product.id) && "fill-current")} />
          </button>
          
          <Button 
            className="btn-hero h-12 md:h-14 px-8 md:px-12 rounded-xl shadow-gold text-xs md:text-sm font-bold"
            onClick={() => addToCart({ ...product, quantity: 1, image: product.image_url })}
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">THÊM VÀO GIỎ</span>
            <span className="sm:hidden">MUA NGAY</span>
          </Button>
        </div>
      </div>
    </div>
  );
}