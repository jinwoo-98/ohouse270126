"use client";

import { useState } from "react";
import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LookProductVerticalItem } from "./LookProductVerticalItem";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LookProductListProps {
  products: any[];
  onQuickView: (product: any) => void;
}

export function LookProductList({ products, onQuickView }: LookProductListProps) {
  const { addToCart } = useCart();
  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE_ITEMS = 3;
  
  const visibleProducts = showAll ? products : products.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = products.length > MAX_VISIBLE_ITEMS;

  const handleAddAllToCart = () => {
    products.forEach((product: any) => addToCart({ ...product, quantity: 1, image: product.image_url }));
    toast.success(`Đã thêm ${products.length} sản phẩm vào giỏ hàng.`);
  };

  return (
    <div className="lg:col-span-1 min-w-0 w-full">
      <h2 className="text-xl font-bold mb-6 text-charcoal uppercase tracking-widest">Sản phẩm trong không gian</h2>
      
      {/* Grid 2 cột trên mobile, 1 cột trên desktop sidebar */}
      <div className={cn(
        "grid gap-4 transition-all duration-500",
        "grid-cols-2 lg:grid-cols-1", // 2 cột trên mobile, 1 cột trên desktop
        !showAll && hasMore ? "max-h-[400px] overflow-hidden" : "max-h-none"
      )}>
        {visibleProducts.map((product: any) => (
          <LookProductVerticalItem 
            key={product.id} 
            product={product} 
            onQuickView={onQuickView} 
            className="rounded-2xl"
            imageClassName="rounded-t-2xl"
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="h-10 px-6 rounded-full border-primary/30 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-subtle group"
          >
            {showAll ? (
              <>Thu gọn <ChevronUp className="w-3.5 h-3.5 ml-2" /></>
            ) : (
              <>Xem tất cả {products.length} sản phẩm <ChevronDown className="w-3.5 h-3.5 ml-2 group-hover:translate-y-1 transition-transform" /></>
            )}
          </Button>
        </div>
      )}
      
      {/* CTA to add all to cart */}
      <Button 
        onClick={handleAddAllToCart}
        className="w-full btn-hero h-12 text-xs font-bold shadow-gold mt-6 rounded-2xl"
      >
        <ShoppingBag className="w-4 h-4 mr-2" /> Thêm tất cả vào giỏ
      </Button>
    </div>
  );
}