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

  // Xử lý trường hợp dữ liệu trả về là mảng từ Supabase join
  const p = Array.isArray(product) ? product[0] : product;
  if (!p) return null;

  const imageUrl = p.image_url || p.image || "/placeholder.svg";

  return (
    <div className="group flex items-center gap-4 p-3 rounded-2xl bg-white hover:bg-primary/5 transition-all shadow-sm border-none">
      <Link 
        to={`/san-pham/${p.slug || p.id}`} 
        onClick={onClose}
        className="w-20 h-20 rounded-xl overflow-hidden bg-secondary/30 shrink-0 border border-border/20"
      >
        <img 
          src={getOptimizedImageUrl(imageUrl, { width: 200 })} 
          alt={p.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          onError={(e) => { (e.target as HTMLImageElement).src = imageUrl; }}
        />
      </Link>
      
      <div className="flex-1 min-w-0 flex flex-col">
        <Link 
          to={`/san-pham/${p.slug || p.id}`} 
          onClick={onClose}
          className="text-xs font-bold text-charcoal hover:text-primary transition-colors line-clamp-1 mb-1"
        >
          {p.name}
        </Link>
        <p className="text-primary font-bold text-sm mb-2">{formatPrice(p.price)}</p>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest rounded-lg btn-hero shadow-none flex-1"
            onClick={() => addToCart({ ...p, quantity: 1, image: imageUrl })}
          >
            <ShoppingBag className="w-3 h-3 mr-1.5" /> Thêm
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-border/60 hover:bg-secondary"
            asChild
          >
            <Link to={`/san-pham/${p.slug || p.id}`} onClick={onClose}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}