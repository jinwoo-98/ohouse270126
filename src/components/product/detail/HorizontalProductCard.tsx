"use client";

import { Link } from "react-router-dom";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getOptimizedImageUrl } from "@/lib/utils";

interface HorizontalProductCardProps {
  product: any;
  onClose?: () => void;
}

export function HorizontalProductCard({ product, onClose }: HorizontalProductCardProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <div className="group flex items-center gap-4 p-3 rounded-2xl bg-white border border-border/40 hover:border-primary/30 transition-all shadow-sm">
      <Link 
        to={`/san-pham/${product.slug || product.id}`} 
        onClick={onClose}
        className="w-20 h-20 rounded-xl overflow-hidden bg-secondary/30 shrink-0 border border-border/20"
      >
        <img 
          src={getOptimizedImageUrl(product.image_url, { width: 200 })} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </Link>
      
      <div className="flex-1 min-w-0 flex flex-col">
        <Link 
          to={`/san-pham/${product.slug || product.id}`} 
          onClick={onClose}
          className="text-xs font-bold text-charcoal hover:text-primary transition-colors line-clamp-1 mb-1"
        >
          {product.name}
        </Link>
        <p className="text-primary font-bold text-sm mb-2">{formatPrice(product.price)}</p>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest rounded-lg btn-hero shadow-none flex-1"
            onClick={() => addToCart({ ...product, quantity: 1, image: product.image_url })}
          >
            <ShoppingBag className="w-3 h-3 mr-1.5" /> Thêm
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-border/60 hover:bg-secondary"
            asChild
          >
            <Link to={`/san-pham/${product.slug || product.id}`} onClick={onClose}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}