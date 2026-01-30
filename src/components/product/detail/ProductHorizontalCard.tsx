"use client";

import { Link } from "react-router-dom";
import { Eye, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

interface ProductHorizontalCardProps {
  product: any;
  onQuickView: (product: any) => void;
}

export function ProductHorizontalCard({ product, onQuickView }: ProductHorizontalCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1, slug: product.slug });
  };

  return (
    <div 
      className="group block card-luxury cursor-pointer relative"
      onClick={() => onQuickView(product)}
    >
      <div className="aspect-square overflow-hidden bg-secondary/10 relative img-zoom">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover" 
        />
        {product.is_sale && <span className="absolute top-2 left-2 bg-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-charcoal shadow-sm rounded-sm">Sale</span>}
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="bg-card text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-medium hover:bg-primary hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
            Xem Nhanh
          </button>
        </div>
      </div>
      <div className="p-4 text-center">
        <Link to={`/san-pham/${product.slug || product.id}`} onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-sm text-charcoal line-clamp-1 mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
        
        <Button 
          size="sm" 
          className="w-full h-8 mt-3 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="w-3 h-3 mr-1" /> Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
}