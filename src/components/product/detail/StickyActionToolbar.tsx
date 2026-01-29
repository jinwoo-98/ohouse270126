"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Heart, ChevronDown } from "lucide-react";
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

  const navItems = [
    { label: "Chi tiết", target: "description" },
    { label: "Đánh giá", target: "reviews" },
    { label: "Phối đồ", target: "inspiration" },
    { label: "Gợi ý", target: "related" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Hiện thanh khi cuộn qua 600px (thường là bắt đầu vào phần mô tả)
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Khoảng cách trừ hao cho thanh sticky
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (!product) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-border/40 z-[100] transition-all duration-500 transform shadow-medium",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container-luxury h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Left Side: Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 lg:gap-4">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollToSection(item.target)}
              className="px-4 py-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] text-charcoal/60 hover:text-primary transition-colors relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          ))}
        </div>

        {/* Mobile View: Simple Indicator */}
        <div className="md:hidden flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Đang xem sản phẩm</span>
           <ChevronDown className="w-3 h-3 text-primary animate-bounce" />
        </div>

        {/* Right Side: Price + Wishlist + Cart */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1">Giá ưu đãi</p>
            <p className="text-primary font-bold text-lg md:text-xl leading-none">{formatPrice(product.price)}</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => toggleWishlist(product)}
              className={cn(
                "p-2.5 md:p-3 rounded-xl border transition-all",
                isInWishlist(product.id) 
                  ? "bg-primary/5 border-primary text-primary shadow-sm" 
                  : "border-border hover:border-primary/40 bg-white"
              )}
              title="Thêm vào yêu thích"
            >
              <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isInWishlist(product.id) && "fill-current")} />
            </button>
            
            <Button 
              className="btn-hero h-11 md:h-13 px-6 md:px-10 rounded-xl shadow-gold text-[10px] md:text-xs font-bold"
              onClick={() => addToCart({ ...product, quantity: 1, image: product.image_url })}
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" /> 
              <span>MUA NGAY</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}