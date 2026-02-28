"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, X, ChevronRight, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface LookQuickViewSheetProps {
  look: any | null;
  isOpen: boolean;
  onClose: () => void;
  onProductQuickView: (product: any) => void;
}

export function LookQuickViewSheet({ look, isOpen, onClose, onProductQuickView }: LookQuickViewSheetProps) {
  const { addToCart } = useCart();

  if (!look) return null;

  const products = look.shop_look_items
    ?.filter((item: any) => item.products)
    .map((item: any) => item.products) || [];

  const handleAddAllToCart = () => {
    products.forEach((p: any) => addToCart({ ...p, quantity: 1, image: p.image_url }));
    toast.success(`Đã thêm ${products.length} sản phẩm vào giỏ hàng.`);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col z-[150] border-none shadow-elevated">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          {/* Header Image Section */}
          <div className="relative aspect-video bg-secondary/20">
            <img 
              src={look.homepage_image_url || look.image_url} 
              className="w-full h-full object-cover" 
              alt={look.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
              <Badge className="mb-3 bg-primary text-white border-none uppercase tracking-widest text-[9px]">
                OHOUSE Inspiration
              </Badge>
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-white uppercase tracking-widest text-left leading-tight">
                  {look.title}
                </SheetTitle>
                <SheetDescription className="text-cream/80 text-xs font-medium uppercase tracking-widest mt-2">
                  {products.length} Sản phẩm trong không gian này
                </SheetDescription>
              </SheetHeader>
            </div>
          </div>

          {/* Product List Section */}
          <div className="p-6 md:p-8">
            <div className="space-y-4">
              {products.map((product: any) => (
                <div 
                  key={product.id} 
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-white border border-border/40 hover:border-primary/30 transition-all shadow-subtle cursor-pointer"
                  onClick={() => onProductQuickView(product)}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary/30 shrink-0 border border-border/20">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h5 className="font-bold text-sm text-charcoal truncate mb-1">{product.name}</h5>
                    <p className="text-primary font-bold text-base">{formatPrice(product.price)}</p>
                    <div className="mt-2 flex items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                      Xem chi tiết <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-10 w-10 rounded-xl shrink-0 hover:bg-primary hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ ...product, quantity: 1, image: product.image_url });
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-border/40 sticky bottom-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] space-y-3">
          <Button 
            className="w-full btn-hero h-14 rounded-2xl shadow-gold text-xs font-bold"
            onClick={handleAddAllToCart}
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> THÊM TẤT CẢ VÀO GIỎ
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-charcoal/20"
            asChild
            onClick={onClose}
          >
            <Link to={`/y-tuong/${look.slug || look.id}`}>
              Xem trang chi tiết không gian <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}