"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Minus, Plus, Loader2, MessageSquare, X } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/product/detail/ProductReviews";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

// Modular Components
import { QuickViewGallery } from "@/components/product/quickview/QuickViewGallery";
import { QuickViewHeader } from "@/components/product/quickview/QuickViewHeader";
import { QuickViewVariants } from "@/components/product/quickview/QuickViewVariants";
import { QuickViewDetails } from "@/components/product/quickview/QuickViewDetails";
import { QuickViewReviewsList } from "@/components/product/quickview/QuickViewReviewsList";
import { QuickViewFooter } from "@/components/product/quickview/QuickViewFooter";

interface QuickViewSheetProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

type SheetView = 'details' | 'reviews';

export function QuickViewSheet({ product, isOpen, onClose }: QuickViewSheetProps) {
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [activeView, setActiveView] = useState<SheetView>('details');
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [activeGallery, setActiveGallery] = useState<string[]>([]);
  const [lastSelectedTier, setLastSelectedTier] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [displayProduct, setDisplayProduct] = useState<any>(null);

  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
      setActiveView('details');
      setQuantity(1);
      setSelectedValues({});
      setLastSelectedTier(null);
      setActiveImage(product.image_url);
      setActiveGallery([product.image_url, ...(product.gallery_urls || [])].filter(Boolean));
      fetchAdditionalData(product.id);
    }
  }, [product]);

  const fetchAdditionalData = async (productId: string) => {
    setIsLoadingDetails(true);
    try {
      const [vRes, rRes, aRes] = await Promise.all([
        supabase.from('product_variants').select('*').eq('product_id', productId),
        supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }),
        supabase.from('product_attributes').select('value, attributes(name)').eq('product_id', productId)
      ]);
      
      setVariants(vRes.data || []);
      setReviews(rRes.data || []);
      
      let dynamicAttributes: any[] = [];
      if (aRes.data) {
        dynamicAttributes = aRes.data.map(item => ({ 
          name: (item.attributes as any)?.name, 
          value: item.value 
        }));
      }
      
      setAttributes(dynamicAttributes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const tierConfig = displayProduct?.tier_variants_config || [];

  const activeVariant = useMemo(() => {
    if (tierConfig.length === 0) return null;
    const allSelected = tierConfig.every((tier: any) => selectedValues[tier.name]);
    if (!allSelected) return null;
    return variants.find(v => Object.entries(v.tier_values).every(([key, val]) => selectedValues[key] === val));
  }, [variants, selectedValues, tierConfig]);

  // Logic hiển thị ảnh thông minh (Đồng bộ với trang chi tiết)
  useEffect(() => {
    if (!displayProduct) return;

    // 1. Ưu tiên 1: Gallery của Biến thể tổ hợp (nếu có ảnh)
    if (activeVariant && activeVariant.gallery_urls && activeVariant.gallery_urls.length > 0) {
      setActiveGallery(activeVariant.gallery_urls);
      setActiveImage(activeVariant.image_url || activeVariant.gallery_urls[0]);
      return;
    }

    // 2. Ưu tiên 2: Gallery của giá trị vừa được click
    if (lastSelectedTier) {
      const tier = tierConfig.find((t: any) => t.name === lastSelectedTier);
      const selectedVal = selectedValues[lastSelectedTier];
      const valueConfig = tier?.values.find((v: any) => v.label === selectedVal);
      
      if (valueConfig?.gallery_urls && valueConfig.gallery_urls.length > 0) {
        setActiveGallery(valueConfig.gallery_urls);
        setActiveImage(valueConfig.image_url || valueConfig.gallery_urls[0]);
        return;
      }
    }

    // 3. Ưu tiên 3: Kiểm tra tất cả các giá trị đang chọn xem có cái nào có gallery không
    for (const tierName in selectedValues) {
      const tier = tierConfig.find((t: any) => t.name === tierName);
      const val = selectedValues[tierName];
      const vConfig = tier?.values.find((v: any) => v.label === val);
      
      if (vConfig?.gallery_urls && vConfig.gallery_urls.length > 0) {
        setActiveGallery(vConfig.gallery_urls);
        setActiveImage(vConfig.image_url || vConfig.gallery_urls[0]);
        return;
      }
    }

    // 4. Mặc định: Gallery của sản phẩm gốc
    const defaultGallery = [displayProduct.image_url, ...(displayProduct.gallery_urls || [])].filter(Boolean);
    setActiveGallery(defaultGallery);
    setActiveImage(displayProduct.image_url);
  }, [activeVariant, selectedValues, lastSelectedTier, displayProduct, tierConfig]);

  const displayPrice = activeVariant ? activeVariant.price : displayProduct?.price;
  const displayOriginalPrice = activeVariant ? activeVariant.original_price : displayProduct?.original_price;

  const handleValueSelect = (tierName: string, value: string) => {
    setSelectedValues(prev => ({ ...prev, [tierName]: value }));
    setLastSelectedTier(tierName);
  };

  const handleAddToCart = () => {
    if (!displayProduct) return;
    if (tierConfig.length > 0 && !activeVariant) {
      const missing = tierConfig.find((t: any) => !selectedValues[t.name]);
      toast.error(`Vui lòng chọn ${missing?.name}`);
      return;
    }
    addToCart({
      id: displayProduct.id,
      name: displayProduct.name,
      price: displayPrice,
      image: displayProduct.image_url,
      quantity,
      variant: activeVariant ? Object.values(activeVariant.tier_values).join(" / ") : undefined,
      variant_id: activeVariant?.id,
      slug: displayProduct.slug
    });
    onClose();
  };

  if (!displayProduct && !isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={cn(
          "p-0 flex flex-col z-[150] border-none shadow-elevated transition-all duration-500",
          isMobile ? "h-[85vh] rounded-t-[32px]" : "w-full sm:max-w-[580px]"
        )}
      >
        {isMobile && (
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>
        )}

        {isMobile && (
          <SheetClose className="absolute right-4 top-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
            <X className="w-5 h-5 text-charcoal" />
          </SheetClose>
        )}
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <AnimatePresence mode="wait">
            {activeView === 'details' && displayProduct ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuickViewGallery 
                  product={displayProduct}
                  activeImage={activeImage}
                  activeGallery={activeGallery}
                  onSelectImage={setActiveImage}
                />

                <div className="p-6 md:p-8 space-y-10 pb-10">
                  <QuickViewHeader 
                    name={displayProduct.name}
                    price={displayPrice}
                    originalPrice={displayOriginalPrice}
                    rating={displayProduct.fake_rating || 5}
                    reviewCount={displayProduct.fake_review_count || reviews.length}
                  />

                  {isLoadingDetails ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <QuickViewVariants 
                      tierConfig={tierConfig}
                      selectedValues={selectedValues}
                      onValueSelect={handleValueSelect}
                    />
                  )}

                  <div className="space-y-3 pt-6 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Số lượng</span>
                    <div className="flex items-center rounded-xl h-12 w-32 bg-secondary/50 border border-border">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="w-4 h-4" /></button>
                      <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <QuickViewDetails 
                    description={displayProduct.description}
                    dimensionImageUrl={displayProduct.dimension_image_url}
                    attributes={attributes}
                  />

                  <div className="space-y-6 pt-6 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Đánh giá thực tế</span>
                      </div>
                      {reviews.length > 0 && (
                        <button 
                          onClick={() => {
                            setActiveView('reviews');
                            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                          }}
                          className="text-[9px] font-bold uppercase text-primary hover:underline"
                        >
                          Xem tất cả ({reviews.length})
                        </button>
                      )}
                    </div>

                    {reviews.length === 0 ? (
                      <div className="py-8 bg-secondary/20 rounded-2xl border border-dashed border-border/40 text-center">
                        <p className="text-[10px] text-muted-foreground italic">Chưa có đánh giá cho sản phẩm này.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.slice(0, 3).map((rev) => (
                          <div key={rev.id} className="bg-white p-4 rounded-xl border border-border/40 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-11px font-bold text-charcoal">{rev.user_name}</span>
                              <StarRating rating={rev.rating} size="w-3 h-3" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">"{rev.comment}"</p>
                            {rev.image_url && (
                              <div className="mt-4 aspect-square w-24 rounded-xl overflow-hidden border border-border/60">
                                 <img src={rev.image_url} className="w-full h-full object-cover" alt={`Đánh giá từ ${rev.user_name}`} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeView === 'reviews' && displayProduct ? (
              <QuickViewReviewsList 
                productName={displayProduct.name}
                rating={displayProduct.fake_rating || 5}
                reviews={reviews}
                onBack={() => setActiveView('details')}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {displayProduct && (
          <QuickViewFooter 
            product={displayProduct}
            isInWishlist={isInWishlist(displayProduct.id)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={() => toggleWishlist(displayProduct)}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}