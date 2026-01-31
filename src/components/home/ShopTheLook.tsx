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

// Cấu hình độ nhạy cho thao tác vuốt
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ShopTheLook() {
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("");
  const [currentLookIndex, setCurrentLookIndex] = useState(0); 
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [[page, direction], setPage] = useState([0, 0]); // State cho animation chuyển slide

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
  }, [activeCategorySlug]);

  // Điều hướng Look (Slide lớn)
  const paginateLook = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
    if (newDirection === 1) {
        setCurrentLookIndex((prev) => (prev + 1) % currentCategoryLooks.length);
    } else {
        setCurrentLookIndex((prev) => (prev - 1 + currentCategoryLooks.length) % currentCategoryLooks.length);
    }
  };

  // Xử lý sự kiện vuốt (Drag End)
  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    // Ưu tiên chuyển Look trước
    if (swipe < -swipeConfidenceThreshold) {
      paginateLook(1); // Vuốt trái -> Next Look
    } else if (swipe > swipeConfidenceThreshold) {
      paginateLook(-1); // Vuốt phải -> Prev Look
    }
  };

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
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {activeLook ? (
              <motion.div
                key={activeLook.id} // Chỉ remount khi đổi Look
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative aspect-video w-full group cursor-grab active:cursor-grabbing"
                drag="x" // BẬT TÍNH NĂNG KÉO
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={activeLook.homepage_image_url || activeLook.image_url}
                  alt={activeLook.title}
                  className="w-full h-full object-cover pointer-events-none" // Quan trọng: Chặn sự kiện chuột vào ảnh để cho phép kéo container
                  draggable="false"
                />
                
                {/* Lớp phủ chứa Hotspot */}
                <div className="absolute inset-0 bg-black/5">
                  <TooltipProvider>
                    {activeLook.shop_look_items
                      .filter((item: any) => item.target_image_url === activeLook.image_url)
                      .map((item: any) => (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => { 
                                e.stopPropagation(); // Ngăn sự kiện drag
                                if (item.products) setQuickViewProduct(item.products); 
                            }}
                            // Thêm touch-action-none để ưu tiên sự kiện click trên mobile cho nút này
                            className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/95 shadow-elevated flex items-center justify-center text-primary hover:scale-125 transition-all duration-300 z-30 group/dot touch-manipulation"
                            style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                          >
                            <span className="absolute w-full h-full rounded-full bg-white/50 animate-ping opacity-75 group-hover/dot:hidden"></span>
                            <Plus className="w-4 h-4" />
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

                {/* Nút điều hướng Lookbook (Chỉ hiện trên Desktop) */}
                {currentCategoryLooks.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); paginateLook(-1); }}
                      className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-20 items-center justify-center group shadow-medium"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); paginateLook(1); }}
                      className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-20 items-center justify-center group shadow-medium"
                    >
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}
                
                {/* Điều chỉnh kích thước và padding trên mobile */}
                <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-md text-cream px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-white/10 pointer-events-none md:top-6 md:left-6 md:px-5 md:py-2 md:text-[10px]">
                  {activeLook.title}
                </div>
                
                {/* Dots indicator */}
                {currentCategoryLooks.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 pointer-events-none">
                    {currentCategoryLooks.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentLookIndex ? "bg-white w-8" : "bg-white/30 w-2"}`}
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

      <QuickViewSheet 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </section>
  );
}