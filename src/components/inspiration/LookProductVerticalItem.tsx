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
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isFavorite = isInWishlist(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...product, quantity: 1, image: product.image_url });
  };

  return (
    <div 
      className={cn(
        "group flex flex-col bg-card rounded-xl overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer",
        className // Cho phép tùy chỉnh layout (ví dụ: flex-row)
      )}
      onClick={() => onQuickView(product)} // Click vào item mở QuickView
    >
      {/* Image Section */}
      <div className={cn("relative aspect-square overflow-hidden bg-secondary/30 shrink-0", imageClassName)}>
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {/* Nút Yêu thích (Top Right) */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            toggleWishlist({ ...product, slug: product.slug }); 
          }}
          className={cn(
            "absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm",
            isFavorite 
              ? "bg-primary text-white" 
              : "bg-white/80 text-charcoal hover:bg-primary hover:text-white"
          )}
          title="Yêu thích"
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      </div>
      
      {/* Info Section */}
      <div className={cn("p-3 flex flex-col items-center text-center", infoClassName)}>
        {/* Tên sản phẩm (Chỉ hiển thị trong layout dọc) */}
        {className?.includes('flex-row') && (
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs font-bold text-charcoal truncate mb-1">{product.name}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between w-full">
          <p className="text-primary font-bold text-sm leading-none">{formatPrice(product.price)}</p>
          {className?.includes('flex-row') && (
            <button 
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-charcoal text-white hover:bg-primary transition-colors shrink-0"
              title="Thêm vào giỏ"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}