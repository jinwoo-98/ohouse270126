"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Star, Minus, Plus, Loader2, Ruler, Info, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProductDescription } from "@/components/product/detail/ProductDescription";

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
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  // Collapsible states for specs
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  // Gallery images
  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedValues({});
      setActiveImage(product.image_url);
      setIsDimensionsOpen(false);
      setIsSpecsOpen(false);
      fetchAdditionalData();
    }
  }, [isOpen, product?.id]);

  const fetchAdditionalData = async () => {
    if (!product) return;
    setIsLoadingDetails(true);
    try {
      const [vRes, rRes, aRes] = await Promise.all([
        supabase.from('product_variants').select('*').eq('product_id', product.id),
        supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('product_attributes').select('value, attributes(name)').eq('product_id', product.id)
      ]);
      
      setVariants(vRes.data || []);
      setReviews(rRes.data || []);
      
      if (aRes.data) {
        setAttributes(aRes.data.map(item => ({ 
          name: (item.attributes as any)?.name, 
          value: item.value 
        })));
      }
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
      toast.error(`Vui lòng chọn ${missing?.name}`);
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
      <SheetContent className="w-full sm:max-w-[580px] p-0 flex flex-col z-[150] border-none shadow-elevated">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          {/* 1. Main Image Container */}
          <div className="relative aspect-square bg-secondary/20 overflow-hidden">
            <img 
              src={activeImage} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-primary text-white uppercase tracking-widest text-[9px] font-bold border-none px-3 py-1 shadow-sm">
                {product.category_id?.replace(/-/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* 2. Gallery Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar bg-white border-b border-border/40">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    activeImage === img ? "border-primary ring-2 ring-primary/10" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="p-6 md:p-8 space-y-10 pb-10">
            {/* 3. Header Info */}
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="text-2xl font-display font-bold leading-tight text-left text-charcoal">
                  {product.name}
                </SheetTitle>
              </SheetHeader>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
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
                <span className="text-xs text-muted-foreground ml-2">({product.fake_review_count || 0} nhận xét)</span>
              </div>
            </div>

            {/* 4. Variant Selection */}
            {isLoadingDetails ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              tierConfig.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-border/40">
                  {tierConfig.map((tier: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {tier.name}: <span className="text-charcoal">{selectedValues[tier.name] || "Chưa chọn"}</span>
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

            {/* 5. Quantity */}
            <div className="space-y-3 pt-6 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Số lượng</span>
              <div className="flex items-center rounded-xl h-12 w-32 bg-secondary/50 border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="w-4 h-4" /></button>
                <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* 6. Product Discovery (Long Description) */}
            <div className="pt-6 border-t border-border/40">
               <ProductDescription description={product.description} />
            </div>

            {/* 7. Collapsible Dimensions & Specs */}
            <div className="space-y-2">
              {product.dimension_image_url && (
                <Collapsible open={isDimensionsOpen} onOpenChange={setIsDimensionsOpen} className="border-b border-border/40 pb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-4 group">
                    <div className="flex items-center gap-3">
                      <Ruler className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Kích thước kỹ thuật</span>
                    </div>
                    {isDimensionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pb-4 animate-accordion-down">
                    <div className="rounded-2xl overflow-hidden border border-border/40 bg-white p-2">
                      <img src={product.dimension_image_url} alt="Kích thước" className="w-full h-auto object-contain" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {attributes.length > 0 && (
                <Collapsible open={isSpecsOpen} onOpenChange={setIsSpecsOpen} className="border-b border-border/40 pb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-4 group">
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Thông số chi tiết</span>
                    </div>
                    {isSpecsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pb-4 animate-accordion-down">
                    <div className="grid gap-2">
                      {attributes.map((attr, i) => (
                        <div key={i} className="flex justify-between py-2.5 border-b border-dashed border-border/40 text-xs">
                          <span className="text-muted-foreground font-medium">{attr.name}</span>
                          <span className="text-charcoal font-bold">
                            {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* 8. Recent Reviews */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Đánh giá gần đây</span>
                 <Link to={`/san-pham/${product.slug}#reviews`} onClick={onClose} className="text-[10px] font-bold text-primary hover:underline flex items-center">
                    Tất cả <ChevronRight className="w-3 h-3 ml-1" />
                 </Link>
              </div>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Sản phẩm chưa có nhận xét nào.</p>
                ) : (
                  reviews.map((rev, i) => (
                    <div key={i} className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-charcoal">{rev.user_name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-2.5 h-2.5", i < rev.rating ? "fill-current" : "text-gray-200")} />)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 9. Optimized Fixed Action Bar */}
        <div className="p-4 md:p-6 border-t border-border bg-card sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            {/* View Details */}
            <Button 
              variant="outline" 
              className="flex-1 h-13 text-[10px] font-bold uppercase tracking-widest border-charcoal/20 rounded-2xl px-2" 
              asChild 
              onClick={onClose}
            >
              <Link to={`/san-pham/${product.slug || product.id}`}>
                XEM CHI TIẾT
              </Link>
            </Button>

            {/* Wishlist Icon Button */}
            <button 
              onClick={() => toggleWishlist(product)}
              className={cn(
                "h-13 w-13 shrink-0 flex items-center justify-center rounded-2xl border transition-all",
                isInWishlist(product.id)
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-white border-border hover:border-primary/40"
              )}
            >
              <Heart className={cn("w-5 h-5", isInWishlist(product.id) && "fill-current")} />
            </button>

            {/* Add to Cart */}
            <Button 
              className="flex-[2] btn-hero h-13 text-[10px] font-bold shadow-gold rounded-2xl"
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