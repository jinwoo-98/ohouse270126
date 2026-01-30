"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingBag, ChevronRight, ChevronLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { QuickViewSheet } from "@/components/QuickViewSheet";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ShopTheLook() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("");
  const [currentLookIndex, setCurrentLookIndex] = useState(0); // Index của Lookbook trong danh mục
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index của ảnh trong Lookbook
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const { data: categoriesData } = useCategories();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: configData } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'shop_look')
        .single();
      if (configData) setConfig(configData);

      const { data, error } = await supabase
        .from('shop_looks')
        .select(`
          *,
          shop_look_items (
            *,
            products:product_id (*)
          )
        `)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setAllLooks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categoriesWithLooks = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.mainCategories.filter(c => 
      c.dropdownKey && allLooks.some(l => l.category_id === c.dropdownKey)
    );
  }, [allLooks, categoriesData]);

  useEffect(() => {
    if (allLooks.length > 0 && categoriesWithLooks.length > 0 && !activeCategorySlug) {
      setActiveCategorySlug(categoriesWithLooks[0].dropdownKey!);
    }
  }, [allLooks, categoriesWithLooks, activeCategorySlug]);
  
  const currentCategoryLooks = useMemo(() => allLooks.filter(l => l.category_id === activeCategorySlug), [allLooks, activeCategorySlug]);
  const activeLook = currentCategoryLooks[currentLookIndex];
  
  const allImages = useMemo(() => {
    if (!activeLook) return [];
    return [activeLook.image_url, ...(activeLook.gallery_urls || [])].filter(Boolean);
  }, [activeLook]);
  
  const currentImageUrl = allImages[currentImageIndex];

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeLook]);

  const goToNextLook = () => {
    setCurrentLookIndex((prev) => (prev + 1) % currentCategoryLooks.length);
    setCurrentImageIndex(0);
  };
  const goToPrevLook = () => {
    setCurrentLookIndex((prev) => (prev - 1 + currentCategoryLooks.length) % currentCategoryLooks.length);
    setCurrentImageIndex(0);
  };
  
  const goToNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const goToPrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (allLooks.length === 0) return null;

  return (
    <section className="py-10 md:py-24 bg-secondary/20 overflow-hidden">
      <div className="container-luxury">
        <div className="text-center mb-10 md:mb-14">
          {config?.subtitle && (
            <span className="font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block" style={{ color: config.subtitle_color }}>
              {config.subtitle}
            </span>
          )}
          <h2 className="section-title mb-4" style={{ color: config?.title_color }}>
            {config?.title || "Shop The Look"}
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto" style={{ color: config?.content_color }}>
            {config?.description || "Khám phá những mẫu thiết kế nội thất hoàn mỹ và sở hữu ngay các sản phẩm trong ảnh chỉ với một cú chạm."}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar px-4">
          {categoriesWithLooks.map((cat) => (
            <button
              key={cat.dropdownKey}
              onClick={() => { 
                setActiveCategorySlug(cat.dropdownKey!); 
                setCurrentLookIndex(0);
                setCurrentImageIndex(0); 
              }}
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all whitespace-nowrap ${
                cat.dropdownKey === activeCategorySlug 
                  ? 'bg-charcoal text-cream border-charcoal shadow-medium' 
                  : 'bg-white border-border text-muted-foreground hover:border-charcoal'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative rounded-3xl overflow-hidden bg-background shadow-elevated border border-border/40">
          <AnimatePresence mode="wait">
            {activeLook ? (
              <motion.div
                key={activeLook.id + currentImageIndex} // Key thay đổi khi Lookbook hoặc ảnh thay đổi
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative aspect-square md:aspect-[16/8] w-full group" 
              >
                <img
                  src={currentImageUrl}
                  alt={activeLook.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black/5">
                  <TooltipProvider>
                    {activeLook.shop_look_items
                      .filter((item: any) => item.target_image_url === currentImageUrl) // Lọc theo ảnh đang hiển thị
                      .map((item: any) => (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => { if (item.products) setQuickViewProduct(item.products); }}
                            className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/95 shadow-elevated flex items-center justify-center text-primary hover:scale-125 transition-all duration-300 z-10 group/dot"
                            style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                          >
                            <span className="absolute w-full h-full rounded-full bg-white/50 animate-ping opacity-75 group-hover/dot:hidden"></span>
                            <Plus className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        {item.products && (
                          <TooltipContent side="top" className="bg-charcoal text-cream border-none p-3 shadow-elevated rounded-xl hidden md:block">
                            <p className="font-bold text-xs uppercase tracking-wider">{item.products.name}</p>
                            <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>

                {/* Navigation Arrows (Chuyển Lookbook) */}
                {currentCategoryLooks.length > 1 && (
                  <>
                    <button 
                      onClick={goToPrevLook} 
                      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-40 bg-card/10 backdrop-blur-md rounded-r-2xl text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 z-20 items-center justify-center group border border-white/10"
                    >
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={goToNextLook} 
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-40 bg-card/10 backdrop-blur-md rounded-l-2xl text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 z-20 items-center justify-center group border border-white/10"
                    >
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
                
                {/* Image Navigation Arrows (Chuyển ảnh trong Lookbook) */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={goToPrevImage} 
                      className="absolute left-16 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-charcoal hover:bg-primary hover:text-white transition-colors z-20 shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={goToNextImage} 
                      className="absolute right-16 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-charcoal hover:bg-primary hover:text-white transition-colors z-20 shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="absolute top-6 left-6 bg-charcoal/80 backdrop-blur-md text-cream px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10">
                  {activeLook.title}
                </div>
                
                {/* Dots for Lookbook Index */}
                {currentCategoryLooks.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {currentCategoryLooks.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setCurrentLookIndex(idx); setCurrentImageIndex(0); }}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentLookIndex ? "bg-white w-8" : "bg-white/30 w-2 hover:bg-white/60"}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="aspect-[16/8] flex items-center justify-center text-muted-foreground italic">
                Đang cập nhật hình ảnh không gian cho danh mục này...
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick View Handler */}
      <QuickViewSheet 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </section>
  );
}