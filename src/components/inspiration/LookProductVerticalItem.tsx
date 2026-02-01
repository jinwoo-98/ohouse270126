import { Link } from "react-router-dom";
import { Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

interface LookProductVerticalItemProps {
  product: any;
  onQuickView: (product: any) => void;
}

export function LookProductVerticalItem({ product, onQuickView }: LookProductVerticalItemProps) {
  const { addToCart } = useCart();

  return (
    <div 
      className="group flex items-center gap-4 p-3 rounded-xl bg-card border border-border/40 hover:shadow-subtle transition-all cursor-pointer"
      onClick={() => onQuickView(product)} // Click vào item mở QuickView
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary/30">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        {/* Chỉ hiển thị giá */}
        <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            addToCart({ ...product, quantity: 1, image: product.image_url });
          }}
          className="p-2 rounded-full text-muted-foreground hover:bg-secondary/50"
          title="Thêm vào giỏ"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          className="p-2 rounded-full text-muted-foreground hover:bg-secondary/50"
          title="Xem nhanh"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}