"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, Truck, Shield, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  categorySlug?: string;
  material?: string;
  style?: string;
}

interface QuickViewSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewSheet({ product, isOpen, onClose }: QuickViewSheetProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const productDetails = {
    description: `Sản phẩm thuộc bộ sưu tập nội thất cao cấp của OHOUSE, được chế tác từ chất liệu ${product.material || "cao cấp"} theo phong cách ${product.style || "hiện đại"}. Mang lại vẻ đẹp tinh tế và sự tiện nghi tối đa cho không gian sống của bạn.`,
    features: [
      `Chất liệu: ${product.material || "Gỗ/Kim loại/Đá cao cấp"}`,
      "Thiết kế chuẩn Ergonomic",
      "Độ bền vượt trội, chống ẩm mốc",
      "Bảo hành chính hãng 2 năm"
    ]
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col z-[100]">
        <div className="flex-1 overflow-y-auto">
          <div className="relative aspect-square">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest">
                {product.categorySlug?.replace('-', ' ') || "Nội Thất"}
              </span>
            </div>
            
            <button 
              onClick={() => toggleWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
              })}
              className={`absolute top-4 right-14 p-2.5 rounded-full shadow-medium transition-all ${
                isInWishlist(product.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6 pb-24">
            <SheetHeader className="space-y-2">
              <SheetTitle className="text-2xl font-bold leading-tight text-left">
                {product.name}
              </SheetTitle>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </SheetHeader>

            <SheetDescription className="text-base text-muted-foreground leading-relaxed text-left">
              {productDetails.description}
            </SheetDescription>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-left">Đặc điểm nổi bật</h4>
              <ul className="space-y-3">
                {productDetails.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-left">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-[10px] uppercase font-bold">Giao nhanh 24h</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-[10px] uppercase font-bold">Bảo hành 2 năm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 text-sm font-semibold" asChild onClick={onClose}>
              <Link to={`/san-pham/${product.id}`}>
                Xem Chi Tiết
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              className="flex-[1.5] btn-hero h-12 text-sm font-bold shadow-gold"
              onClick={() => {
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  quantity: 1
                });
                onClose();
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Thêm Vào Giỏ
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}