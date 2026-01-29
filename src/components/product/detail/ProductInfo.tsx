import { useState } from "react";
import { 
  Star, Minus, Plus, ShoppingBag, Heart, 
  Truck, Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: any;
  attributes: any[];
  reviewsCount: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ProductInfo({ product, attributes, reviewsCount }: ProductInfoProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const isFavorite = isInWishlist(product.id);
  const displayRating = product.fake_rating || 5;
  const displayReviewCount = (product.fake_review_count || 0) + reviewsCount;
  const displaySold = product.fake_sold || 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Info */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary" className="bg-secondary text-primary uppercase tracking-widest text-[10px] font-bold">
            {product.category_id}
          </Badge>
          {product.is_new && <Badge className="bg-blue-600 text-[10px] h-5 font-bold uppercase">Hàng Mới</Badge>}
          {displaySold > 0 && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Đã bán {displaySold}</span>}
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-charcoal leading-tight mb-4">{product.name}</h1>
        
        <div className="flex flex-wrap items-end gap-4 md:gap-6">
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("w-4 h-4", i < Math.floor(displayRating) ? "fill-current" : "text-gray-200")} />
              ))}
            </div>
            <a href="#reviews" className="text-xs font-bold underline ml-2 text-charcoal hover:text-primary">
              {displayReviewCount} đánh giá
            </a>
          </div>
          
          <div className="h-4 w-px bg-border hidden md:block"></div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-sm text-muted-foreground line-through decoration-destructive/30">{formatPrice(product.original_price)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Attributes */}
      {attributes.length > 0 && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-6 border-y border-dashed border-border/60">
          {attributes.map((attr, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{attr.name}</span>
              <span className="text-sm font-medium text-charcoal">{Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-border rounded-full h-14 w-32 bg-white">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="w-4 h-4" /></button>
            <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="w-4 h-4" /></button>
          </div>
          
          <Button size="lg" className="flex-1 btn-hero h-14 rounded-full text-sm font-bold shadow-lg shadow-primary/20" onClick={() => addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url,
            quantity
          })}>
            <ShoppingBag className="w-5 h-5 mr-2" /> THÊM VÀO GIỎ
          </Button>
          
          <Button size="icon" variant="outline" className={`h-14 w-14 rounded-full border-2 ${isFavorite ? 'text-primary border-primary bg-primary/5' : 'border-border text-muted-foreground hover:text-primary hover:border-primary'}`} onClick={() => toggleWishlist({
             id: product.id,
             name: product.name,
             price: product.price,
             image: product.image_url
          })}>
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground pt-4">
          <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-charcoal" /> Miễn phí vận chuyển đơn {">"} 5TR</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-charcoal" /> Bảo hành chính hãng 2 năm</div>
        </div>
      </div>
    </div>
  );
}