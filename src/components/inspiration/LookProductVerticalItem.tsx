import { Link } from "react-router-dom";
import { Eye, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice, cn } from "@/lib/utils";

interface LookProductVerticalItemProps {
  product: any;
  onQuickView: (product: any) => void;
  className?: string;
  imageClassName?: string;
  infoClassName?: string;
}

export function LookProductVerticalItem({ product, onQuickView, className, imageClassName, infoClassName }: LookProductVerticalItemProps) {
  // Loại bỏ logic Wishlist và Cart khỏi thẻ tối giản này
  
  return (
    <div 
      className={cn(
        "group flex flex-col overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer bg-card",
        className
      )}
      onClick={() => onQuickView(product)} // Hành vi chính: Mở QuickView
    >
      {/* Image Section */}
      <Link to={`/san-pham/${product.slug || product.id}`} onClick={(e) => e.stopPropagation()} className={cn(
        "relative aspect-square overflow-hidden bg-secondary/30 shrink-0", 
        imageClassName
      )}>
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {/* Lớp phủ hover (chỉ còn lớp mờ) */}
        <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {/* Loại bỏ nút Xem Nhanh */}
        </div>
      </Link>
      
      {/* Info Section: Chỉ hiển thị Giá */}
      <div className={cn("p-2 flex flex-col items-center text-center", infoClassName)}>
        <p className="text-primary font-bold text-sm leading-none">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}