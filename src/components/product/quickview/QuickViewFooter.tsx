"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickViewFooterProps {
  product: any;
  isInWishlist: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onClose: () => void;
}

export function QuickViewFooter({ product, isInWishlist, onAddToCart, onToggleWishlist, onClose }: QuickViewFooterProps) {
  return (
    <div className="p-4 md:p-6 border-t border-border bg-card sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-5">
        <Button variant="outline" className="flex-1 h-14 text-[10px] font-bold uppercase tracking-widest border-charcoal/20 rounded-2xl px-2" asChild onClick={onClose}>
          <Link to={`/san-pham/${product.slug || product.id}`}>XEM CHI TIẾT</Link>
        </Button>
        <button 
          onClick={onToggleWishlist} 
          className={cn(
            "h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl border transition-all", 
            isInWishlist ? "bg-primary/5 border-primary text-primary shadow-sm" : "bg-white border-border hover:border-primary/40"
          )}
        >
          <Heart className={cn("w-6 h-6", isInWishlist && "fill-current")} />
        </button>
        <Button 
          className="flex-[2] btn-hero h-14 text-[10px] font-bold shadow-gold rounded-2xl" 
          onClick={onAddToCart}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />THÊM VÀO GIỎ
        </Button>
      </div>
    </div>
  );
}