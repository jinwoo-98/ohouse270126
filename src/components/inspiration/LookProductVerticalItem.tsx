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
  
  const isSidebarLayout = className?.includes('flex-row');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...product, quantity: 1, image: product.image_url });
  };

  return (
    <div 
      className={cn(
        "group flex overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer",
        isSidebarLayout ? "bg-card flex-row items-center p-3 rounded-xl" : "flex-col bg-transparent rounded-xl",
        className
      )}
      onClick={() => onQuickView(product)} // Click vào item mở QuickView
    >
      {/* Image Section */}
      <div className={cn(
        "relative aspect-square overflow-hidden bg-secondary/30 shrink-0", 
        isSidebarLayout ? "w-16 h-16 rounded-lg" : "rounded-xl",
        imageClassName
      )}>
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {/* Nút Yêu thích (Chỉ hiện khi không phải sidebar layout) */}
        {!isSidebarLayout && (
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
        )}
      </div>
      
      {/* Info Section */}
      <div className={cn(
        "flex flex-col", 
        isSidebarLayout ? "flex-1 min-w-0 pl-3" : "p-3 items-center text-center",
        infoClassName
      )}>
        
        <div className={cn("flex items-center w-full", isSidebarLayout ? "justify-between" : "justify-center")}>
          <div className={cn(isSidebarLayout ? "flex-1 min-w-0 pr-2" : "flex-1")}>
            <p className={cn("font-bold text-charcoal truncate", isSidebarLayout ? "text-xs mb-1" : "text-sm mb-1")}>
              {product.name}
            </p>
            <p className="text-primary font-bold text-sm leading-none">{formatPrice(product.price)}</p>
          </div>
          
          {isSidebarLayout && (
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