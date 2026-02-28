"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LookProductVerticalItem } from "./LookProductVerticalItem";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface LookQuickViewSheetProps {
  look: any | null;
  isOpen: boolean;
  onClose: () => void;
  onProductQuickView: (product: any) => void;
}

export function LookQuickViewSheet({ look, isOpen, onClose, onProductQuickView }: LookQuickViewSheetProps) {
  const isMobile = useIsMobile();
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
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={cn(
          "p-0 flex flex-col z-[150] border-none shadow-elevated transition-all duration-500",
          isMobile ? "h-[85vh] rounded-t-[32px]" : "w-full sm:max-w-[500px]"
        )}
      >
        {/* Drag Handle cho Mobile */}
        {isMobile && (
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-white sticky top-0 z-10 flex items-start justify-between">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg font-bold text-charcoal uppercase tracking-widest">
              Sản phẩm trong không gian
            </SheetTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
              {look.title} • {products.length} sản phẩm
            </p>
          </SheetHeader>
          
          {/* Nút đóng thủ công cho mobile nếu cần, mặc định SheetContent có nút X ở góc */}
          <SheetClose className="p-2 hover:bg-secondary rounded-full transition-colors lg:hidden">
            <X className="w-5 h-5 text-muted-foreground" />
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-secondary/5 p-6">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product: any) => (
              <LookProductVerticalItem 
                key={product.id} 
                product={product} 
                onQuickView={onProductQuickView} 
                className="rounded-2xl shadow-sm border-none"
                imageClassName="rounded-t-2xl"
              />
            ))}
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
              Xem chi tiết không gian <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { cn } from "@/lib/utils";