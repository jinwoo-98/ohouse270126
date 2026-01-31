"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { QuickViewSheet } from "@/components/QuickViewSheet";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};

export function ShopTheLook() {
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("");
  const [currentLookIndex, setCurrentLookIndex] = useState(0); 
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [[page, direction], setPage] = useState([0, 0]);

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
          homepage_image_url,
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
  
  useEffect(() => {
    setCurrentLookIndex(0);
    setPage([0, 0]);
  }, [activeCategorySlug]);

  const paginateLook = (newDirection: number) => {
    if (currentCategoryLooks.length <= 1) return;
    const newIndex = (currentLookIndex + newDirection + currentCategoryLooks.length) % currentCategoryLooks.length;
    setPage([page + newDirection, newDirection]);
    setCurrentLookIndex(newIndex);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    if (currentCategoryLooks.length <= 1) return;
    
    const swipe = swipePower(offset.x, velocity.x);
    const threshold = window.innerWidth < 768 ? 500 : swipeConfidenceThreshold;

    if (swipe < -threshold) {
      paginateLook(1);
    } else if (swipe > threshold) {
      paginateLook(-1);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (allLooks.length === 0) return null;
  
  const hasMultipleLooks = currentCategoryLooks.length > 1;

  return (
    <section className="py-10 md:py-24 bg-secondary/20 overflow-hidden">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
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
        </motion.div>

        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar px-4">
          {categoriesWithLooks.map((cat) => (
            <button
              key={cat.dropdownKey}
              onClick={() => { 
                setActiveCategorySlug(cat.dropdownKey!); 
              }}
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all whitespace-nowrap ${
                cat.dropdownKey === activeCategorySlug 
                  ? 'bg-charcoal text-cream border-charcoal shadow-medium' 
                  : 'bg-white border-border text-muted-foreground hover:border-charcoal rounded-lg'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-transparent shadow-elevated border border-border/40">
          <div className="bg-background relative">
            <AnimatePresence initial={false} custom={direction}>
              {activeLook ? (
                <motion.div
                  key={activeLook.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                  }}
                  className="absolute inset-0 aspect-video w-full group cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragEnd={handleDragEnd}
                >
                  <Link to={`/y-tuong/${activeLook.id}`} className="absolute inset-0 z-10">
                    <img
                      src={activeLook.homepage_image_url || activeLook.image_url}
                      alt={activeLook.title}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable="false"
                    />
                  </Link>
                  
                  <div className="absolute inset-0 bg-black/5">
                    <TooltipProvider>
                      {activeLook.shop_look_items
                        .filter((item: any) => item.target_image_url === activeLook.image_url)
                        .map((item: any) => (
                        <Tooltip key={item.id} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => { 
                                  e.stopPropagation();
                                  if (item.products) setQuickViewProduct(item.products); 
                              }}
                              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-30 group/dot touch-manipulation"
                              style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                            >
                              <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden"></span>
                              <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
                            </button>
                          </TooltipTrigger>
                          {item.products && (
                            <TooltipContent side="top" className="bg-charcoal text-cream border-none p-3 shadow-elevated rounded-xl hidden md:block z-40">
                              <p className="font-bold text-xs uppercase tracking-wider">{item.products.name}</p>
                              <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                  
                </motion.div>
              ) : (
                <div className="aspect-[16/8] flex items-center justify-center text-muted-foreground italic">
                  Đang cập nhật hình ảnh không gian cho danh mục này...
                </div>
              )}
            </AnimatePresence>
            <div className="aspect-video" /> 
          </div>
          
          {hasMultipleLooks && (
            <>
              <button 
                onClick={() => paginateLook(-1)} 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-20 items-center justify-center group shadow-medium hidden md:flex"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={() => paginateLook(1)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-20 items-center justify-center group shadow-medium hidden md:flex"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {currentCategoryLooks.length > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 bg-secondary/20">
              {currentCategoryLooks.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => paginateLook(idx - currentLookIndex)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentLookIndex ? "bg-primary w-8 md:w-12" : "bg-muted-foreground/30 w-2 md:w-3 hover:bg-primary/60"}`}
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