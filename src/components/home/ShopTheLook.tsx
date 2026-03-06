"use client";

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, ArrowRight, ChevronRight as ArrowIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl, formatPrice, cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export function ShopTheLook() {
  const navigate = useNavigate();
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

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
        .maybeSingle();
      if (configData) setConfig(configData);

      const { data, error } = await supabase
        .from('shop_looks')
        .select(`
          *,
          slug,
          homepage_image_url,
          shop_look_items (
            *,
            products (*)
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAllLooks(data || []);
    } catch (e) {
      console.error("Error fetching ShopTheLook data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setActiveHotspotId(null); // Reset hotspot khi chuyển slide
    });
  }, [api]);

  const categoriesWithLooks = useMemo(() => {
    if (!categoriesData?.allCategories || allLooks.length === 0) return [];
    const lookCategoryIds = new Set(allLooks.map(l => l.category_id).filter(Boolean));
    const parentCategoryIds = new Set<string>();
    
    lookCategoryIds.forEach(catId => {
        const category = categoriesData.allCategories.find((c: any) => c.id === catId);
        if (category) {
            if (category.parent_id) parentCategoryIds.add(category.parent_id);
            else parentCategoryIds.add(category.id);
        }
    });
    
    return categoriesData.allCategories
      .filter((c: any) => parentCategoryIds.has(c.id))
      .sort((a: any, b: any) => a.display_order - b.display_order);
  }, [allLooks, categoriesData?.allCategories]);

  const currentCategoryLooks = useMemo(() => {
    if (activeCategorySlug === "all") return allLooks;
    if (!categoriesData?.allCategories) return [];
    
    const selectedParentCategory = categoriesData.allCategories.find((c: any) => c.slug === activeCategorySlug);
    if (!selectedParentCategory) return [];
    
    const parentId = selectedParentCategory.id;
    const childCategoryIds = categoriesData.allCategories
        .filter((c: any) => c.parent_id === parentId)
        .map((c: any) => c.id);
    
    const targetCategoryIds = [parentId, ...childCategoryIds];
    return allLooks.filter(look => targetCategoryIds.includes(look.category_id));
  }, [allLooks, activeCategorySlug, categoriesData?.allCategories]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (allLooks.length === 0) return null;

  return (
    <section className="py-10 md:py-24 bg-background overflow-hidden">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-14"
        >
          {config?.subtitle && (
            <span className="font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block" style={{ color: config.subtitle_color }}>
              {config.subtitle}
            </span>
          )}
          <h2 className="section-title mb-4 text-charcoal" style={{ color: config?.title_color }}>
            {config?.title || "Shop The Look"}
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto mb-8 text-muted-foreground" style={{ color: config?.content_color }}>
            {config?.description || "Khám phá những mẫu thiết kế nội thất hoàn mỹ và sở hữu ngay các sản phẩm trong ảnh chỉ với một cú chạm."}
          </p>

          <div className="flex justify-center mb-10">
            <Button 
              asChild 
              variant="outline" 
              className="h-12 px-8 rounded-lg border-charcoal/20 text-charcoal font-bold text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all group"
            >
              <Link to="/cam-hung">
                Khám phá tất cả cảm hứng <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-nowrap justify-start md:justify-center gap-2 mb-8 md:mb-10 overflow-x-auto no-scrollbar-x px-4 md:px-0 pb-4 touch-pan-x">
            <button
              onClick={() => setActiveCategorySlug("all")}
              className={cn(
                "px-4 md:px-6 py-2 md:py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all whitespace-nowrap shrink-0 active:scale-95",
                activeCategorySlug === "all" 
                  ? 'bg-primary text-white border-primary shadow-gold' 
                  : 'bg-secondary/50 border-border/40 text-muted-foreground hover:border-primary/40'
              )}
            >
              Tất cả các phòng
            </button>
            {categoriesWithLooks.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug!)}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all whitespace-nowrap shrink-0 active:scale-95",
                  cat.slug === activeCategorySlug 
                    ? 'bg-primary text-white border-primary shadow-gold' 
                    : 'bg-secondary/50 border-border/40 text-muted-foreground hover:border-primary/40'
                )}
              >
                {cat.name}
              </button>
            ))}
            <div className="w-6 shrink-0 md:hidden" />
          </div>
        </motion.div>

        <div className="relative rounded-2xl overflow-hidden bg-transparent shadow-medium border border-border/40">
          <Carousel 
            setApi={setApi}
            opts={{ 
              align: "start", 
              loop: true,
              skipSnaps: false,
              dragFree: false 
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-0 touch-pan-y">
              {currentCategoryLooks.map((look) => {
                const detailLink = `/y-tuong/${look.slug || look.id}`;
                const displayImage = look.homepage_image_url || look.image_url;
                
                return (
                  <CarouselItem key={look.id} className="pl-0 basis-full">
                    <div className="relative aspect-video overflow-hidden group">
                      <div 
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={() => navigate(detailLink)}
                      >
                        <img
                          src={getOptimizedImageUrl(displayImage, { width: 1200 })}
                          alt={look.title}
                          className="w-full h-full object-cover pointer-events-none"
                          loading="lazy"
                          draggable="false"
                          onError={(e) => { (e.target as HTMLImageElement).src = displayImage; }}
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/5 pointer-events-none">
                        {look.shop_look_items
                          ?.filter((item: any) => item.target_image_url === displayImage && item.products)
                          .map((item: any) => {
                            const isActive = activeHotspotId === item.id;
                            return (
                              <div 
                                key={item.id}
                                className="absolute z-30 transition-all duration-500 pointer-events-auto"
                                style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                              >
                                <button
                                  className="group relative w-8 h-8 -ml-4 -mt-4 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 z-30"
                                  onMouseEnter={() => setActiveHotspotId(item.id)}
                                >
                                  <div className={cn(
                                    "w-3 h-3 rounded-full bg-white transition-all duration-300",
                                    isActive ? "scale-[0.67]" : "scale-100"
                                  )} />
                                  <div className={cn(
                                    "absolute inset-0 rounded-full border-white transition-all duration-300",
                                    isActive ? "opacity-100 border-[1px]" : "opacity-0 border-0"
                                  )} />
                                </button>

                                <AnimatePresence>
                                  {isActive && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                      className="absolute bottom-full left-0 mb-12 flex items-center shadow-elevated rounded-xl overflow-visible z-50 bg-white"
                                      style={{ left: '-21px' }}
                                    >
                                      <div 
                                        className="absolute top-full w-[1px] h-12 bg-white pointer-events-none shadow-sm z-50" 
                                        style={{ left: '21px', transform: 'translateX(-50%)' }}
                                      />
                                      <div className="w-[143px] h-[72px] bg-white p-3 flex flex-col justify-center text-left border-r border-border/40 rounded-l-xl">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate mb-1">
                                          {item.products.category_id?.replace(/-/g, ' ') || "Sản phẩm"}
                                        </p>
                                        <p className="text-sm font-bold text-primary truncate">
                                          {formatPrice(item.products.price)}
                                        </p>
                                      </div>
                                      <button
                                        className="w-[24px] h-[72px] bg-white flex items-center justify-center text-primary hover:bg-primary/5 transition-colors rounded-r-xl"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setQuickViewProduct(item.products);
                                        }}
                                      >
                                        <ArrowIcon className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        
                        <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block pointer-events-auto">
                          <Button asChild size="sm" className="btn-hero h-9 text-[10px] shadow-gold px-4">
                            <Link to={detailLink}>
                              Xem Chi Tiết <ChevronRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {currentCategoryLooks.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex left-4 bg-white/80 backdrop-blur-md border-none shadow-medium" />
                <CarouselNext className="hidden md:flex right-4 bg-white/80 backdrop-blur-md border-none shadow-medium" />
              </>
            )}
          </Carousel>

          {count > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 bg-secondary/20">
              {Array.from({ length: count }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => api?.scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === current ? "bg-primary w-8 md:w-12" : "bg-charcoal/10 w-2 md:w-3 hover:bg-primary/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewSheet 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </section>
  );
}