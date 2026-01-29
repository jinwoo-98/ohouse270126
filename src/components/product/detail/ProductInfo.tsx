import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Star, Minus, Plus, ShoppingBag, Heart, 
  Truck, Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: any;
  attributes: any[];
  comboProducts: any[];
  reviewsCount: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ProductInfo({ product, attributes, comboProducts, reviewsCount }: ProductInfoProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const isFavorite = isInWishlist(product.id);
  const displayRating = product.fake_rating || 5;
  const displayReviewCount = (product.fake_review_count || 0) + reviewsCount;
  const displaySold = product.fake_sold || 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-primary border-primary uppercase tracking-widest text-[10px]">
            {product.category_id}
          </Badge>
          {product.is_new && <Badge className="bg-blue-500 text-[10px] h-5">MỚI</Badge>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal leading-tight">{product.name}</h1>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-4 h-4", i < Math.floor(displayRating) ? "fill-current" : "text-gray-200")} />
            ))}
          </div>
          <a href="#reviews" className="text-sm text-muted-foreground border-l border-border pl-4 hover:text-primary underline">
            Xem {displayReviewCount} đánh giá
          </a>
          {displaySold > 0 && (
            <span className="text-sm text-muted-foreground border-l border-border pl-4">
              Đã bán {displaySold}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-2xl">
        <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
        {product.original_price && (
          <div className="flex flex-col">
            <span className="text-lg text-muted-foreground line-through decoration-destructive/50">{formatPrice(product.original_price)}</span>
            <Badge variant="destructive" className="text-[10px] w-fit">
              Tiết kiệm {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
            </Badge>
          </div>
        )}
      </div>

      {/* Mua Cùng (Combo) */}
      {comboProducts.length > 0 && (
        <div className="border border-border rounded-2xl p-4 bg-white shadow-sm">
          <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">Thường được mua cùng</h4>
          <div className="space-y-3">
            {comboProducts.map(combo => (
              <div key={combo.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                  <img src={combo.image_url} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/san-pham/${combo.id}`} className="text-sm font-bold hover:text-primary line-clamp-1">{combo.name}</Link>
                  <span className="text-xs text-primary font-bold">{formatPrice(combo.price)}</span>
                </div>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" onClick={() => addToCart({...combo, quantity: 1})}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {attributes.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {attributes.slice(0, 4).map((attr, i) => (
            <div key={i} className="flex flex-col text-sm p-3 rounded-lg bg-secondary/10 border border-border/50">
              <span className="text-muted-foreground text-[10px] uppercase font-bold mb-1">{attr.name}</span>
              <span className="font-medium text-charcoal">{Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="flex items-center border border-border rounded-xl bg-card h-14">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full hover:bg-secondary transition-colors flex items-center justify-center rounded-l-xl"><Minus className="w-4 h-4" /></button>
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full hover:bg-secondary transition-colors flex items-center justify-center rounded-r-xl"><Plus className="w-4 h-4" /></button>
        </div>
        <Button size="lg" className="flex-1 btn-hero h-14 text-sm font-bold shadow-gold rounded-xl" onClick={() => addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url,
          quantity
        })}>
          <ShoppingBag className="w-5 h-5 mr-2" /> THÊM VÀO GIỎ
        </Button>
        <Button size="lg" variant="outline" className={`h-14 w-14 rounded-xl border-2 ${isFavorite ? 'text-primary border-primary bg-primary/5' : 'hover:border-primary hover:text-primary'}`} onClick={() => toggleWishlist({
           id: product.id,
           name: product.name,
           price: product.price,
           image: product.image_url
        })}>
          <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Policy Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="shipping" className="border-border">
          <AccordionTrigger className="hover:no-underline hover:text-primary py-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-bold uppercase tracking-wider">Vận chuyển & Đổi trả</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed pl-8">
            <ul className="list-disc space-y-2 text-sm">
              <li>Miễn phí vận chuyển cho đơn hàng trên 5.000.000đ.</li>
              <li>Giao hàng nhanh 24h trong nội thành TP.HCM & Hà Nội.</li>
              <li>Đổi trả miễn phí trong vòng 30 ngày nếu có lỗi sản xuất.</li>
              <li>Kiểm tra hàng trước khi thanh toán.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="warranty" className="border-border">
          <AccordionTrigger className="hover:no-underline hover:text-primary py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-bold uppercase tracking-wider">Chính sách bảo hành</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed pl-8">
            <p className="text-sm">Sản phẩm được bảo hành chính hãng 2 năm về kết cấu và chất liệu. Hỗ trợ bảo trì trọn đời sản phẩm.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}