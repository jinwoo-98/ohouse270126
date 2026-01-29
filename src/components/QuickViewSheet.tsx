"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, Truck, Shield, ArrowRight, Heart, Star, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuickViewSheetProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewSheet({ product, isOpen, onClose }: QuickViewSheetProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Reset state when product changes or opens
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedValues({});
      fetchAdditionalData();
    }
  }, [isOpen, product?.id]);

  const fetchAdditionalData = async () => {
    if (!product) return;
    setIsLoadingDetails(true);
    try {
      const [vRes, rRes] = await Promise.all([
        supabase.from('product_variants').select('*').eq('product_id', product.id),
        supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false }).limit(3)
      ]);
      setVariants(vRes.data || []);
      setReviews(rRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const tierConfig = product?.tier_variants_config || [];

  const activeVariant = useMemo(() => {
    if (tierConfig.length === 0) return null;
    const allSelected = tierConfig.every((tier: any) => selectedValues[tier.name]);
    if (!allSelected) return null;
    return variants.find(v => Object.entries(v.tier_values).every(([key, val]) => selectedValues[key] === val));
  }, [variants, selectedValues, tierConfig]);

  const displayPrice = activeVariant ? activeVariant.price : product?.price;
  const displayOriginalPrice = activeVariant ? activeVariant.original_price : product?.original_price;

  if (!product) return null;

  const handleAddToCart = () => {
    if (tierConfig.length > 0 && !activeVariant) {
      const missing = tierConfig.find((t: any) => !selectedValues[t.name]);
      alert(`Vui lòng chọn ${missing?.name}`);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image_url,
      quantity,
      variant: activeVariant ? Object.values(activeVariant.tier_values).join(" / ") : undefined,
      variant_id: activeVariant?.id,
      slug: product.slug
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[500px] p-0 flex flex-col z-[150] border-none shadow-elevated">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Image Header */}
          <div className="relative aspect-square bg-secondary/20">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-primary text-white uppercase tracking-widest text-[9px] font-bold border-none px-3 py-1">
                {product.category_id?.replace('-', ' ')}
              </Badge>
            </div>
            
            <button 
              onClick={() => toggleWishlist(product)}
              className={cn(
                "absolute top-4 right-4 p-3 rounded-full shadow-elevated transition-all z-10",
                isInWishlist(product.id)
                  ? 'bg-primary text-white'
                  : 'bg-white/80 backdrop-blur-md hover:bg-primary hover:text-white'
              )}
            >
              <Heart className={cn("w-5 h-5", isInWishlist(product.id) && "fill-current")} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-8 pb-32">
            {/* Title & Price */}
            <div className="space-y-3">
              <SheetHeader>
                <SheetTitle className="text-2xl font-display font-bold leading-tight text-left text-charcoal">
                  {product.name}
                </SheetTitle>
              </SheetHeader>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(displayPrice)}
                </span>
                {displayOriginalPrice && (
                  <span className="text-sm text-muted-foreground line-through opacity-50">
                    {formatPrice(displayOriginalPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < Math.floor(product.fake_rating || 5) ? "fill-current" : "text-gray-200")} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">({product.fake_review_count || 0} đánh giá)</span>
              </div>
            </div>

            {/* Variant Selection */}
            {isLoadingDetails ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              tierConfig.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-border/40">
                  {tierConfig.map((tier: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Chọn {tier.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tier.values.map((val: string) => (
                          <button
                            key={val}
                            onClick={() => setSelectedValues(prev => ({ ...prev, [tier.name]: val }))}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                              selectedValues[tier.name] === val 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-border bg-white hover:border-primary/40 text-charcoal"
                            )}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Số lượng</span>
              <div className="flex items-center rounded-xl h-12 w-32 bg-secondary/50 border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="w-4 h-4" /></button>
                <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Description Summary */}
            <div className="space-y-3">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Mô tả ngắn</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.short_description || "Sản phẩm nội thất cao cấp từ thương hiệu OHOUSE, mang lại vẻ đẹp tinh tế và đẳng cấp cho không gian sống của bạn."}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4 pt-6 border-t border-border/40">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Nhận xét khách hàng</span>
                 <Link to={`/san-pham/${product.slug}#reviews`} onClick={onClose} className="text-[10px] font-bold text-primary hover:underline">Xem tất cả</Link>
              </div>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  reviews.map((rev, i) => (
                    <div key={i} className="bg-secondary/20 p-3 rounded-xl border border-border/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-charcoal">{rev.user_name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-2 h-2", i < rev.rating ? "fill-current" : "text-gray-200")} />)}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 italic">"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Bar */}
        <div className="p-4 md:p-6 border-t border-border bg-card sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 h-14 text-xs font-bold uppercase tracking-widest border-charcoal/20 rounded-2xl" asChild onClick={onClose}>
              <Link to={`/san-pham/${product.slug || product.id}`}>
                Xem chi tiết
              </Link>
            </Button>
            <Button 
              className="flex-[1.5] btn-hero h-14 text-xs font-bold shadow-gold rounded-2xl"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              THÊM VÀO GIỎ
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}