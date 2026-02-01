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
  // Thẻ này được thiết kế để trông giống như thẻ tối giản (ảnh trên, giá dưới)
  // nhưng được đặt trong bố cục dọc.
  
  return (
    <div 
      className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer"
      onClick={() => onQuickView(product)} // Click vào item mở QuickView
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30 shrink-0">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {/* Nút Xem Nhanh trên ảnh (Desktop only) */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white text-charcoal p-2 rounded-full shadow-lg">
            <Eye className="w-5 h-5" />
          </span>
        </div>
      </div>
      
      {/* Info Section (Chỉ giá) */}
      <div className="p-3 flex flex-col items-center text-center">
        <p className="text-primary font-bold text-sm leading-none">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}