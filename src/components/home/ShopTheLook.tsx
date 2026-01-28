import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingBag, ChevronRight, ChevronLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { mainCategories } from "@/constants/header-data";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<any>(null);

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
            products:product_id (id, name, price, original_price, image_url, description, category_id)
          )
        `)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setAllLooks(data || []);

      if (data && data.length > 0) {
        const firstWithData = mainCategories.find(c => data.some(l => l.category_id === c.dropdownKey));
        if (firstWithData) setActiveCategorySlug(firstWithData.dropdownKey!);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryLooks = allLooks.filter(l => l.category_id === activeCategorySlug);
  const activeLook = currentCategoryLooks[currentImageIndex];

  useEffect(() => {
    if (selectedProductId && activeLook) {
      const item = activeLook.shop_look_items.find((i: any) => i.product_id === selectedProductId);
      if (item && item.products) {
        setProductDetails(item.products);
      }
    }
  }, [selectedProductId, activeLook]);

  const goToNext = () => setCurrentImageIndex((prev) => (prev + 1) % currentCategoryLooks.length);
  const goToPrev = () => setCurrentImageIndex((prev) => (prev - 1 + currentCategoryLooks.length) % currentCategoryLooks.length);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (allLooks.length === 0) return null;

  const categoriesWithLooks = mainCategories.filter(c => 
    c.dropdownKey && allLooks.some(l => l.category_id === c.dropdownKey)
  );

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
                setCurrentImageIndex(0); 
                setSelectedProductId(null); 
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
                key={activeLook.id} 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative aspect-[4/3] md:aspect-[21/9] w-full group" 
              >
                <img
                  src={activeLook.image_url}
                  alt={activeLook.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black/5">
                  {activeLook.shop_look_items.map((item: any) => (
                    <TooltipProvider key={item.id}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedProductId(selectedProductId === item.product_id ? null : item.product_id)}
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
                    </TooltipProvider>
                  ))}
                </div>

                {currentCategoryLooks.length > 1 && (
                  <>
                    <button 
                      onClick={goToPrev} 
                      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-40 bg-card/10 backdrop-blur-md rounded-r-2xl text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 z-20 items-center justify-center group border border-white/10"
                    >
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={goToNext} 
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-40 bg-card/10 backdrop-blur-md rounded-l-2xl text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 z-20 items-center justify-center group border border-white/10"
                    >
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                      {currentCategoryLooks.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? "bg-white w-8" : "bg-white/30 w-2 hover:bg-white/60"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute top-6 left-6 bg-charcoal/80 backdrop-blur-md text-cream px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10">
                  {activeLook.title}
                </div>
              </motion.div>
            ) : (
              <div className="aspect-[21/9] flex items-center justify-center text-muted-foreground italic">
                Đang cập nhật hình ảnh không gian cho danh mục này...
              </div>
            )}
          </AnimatePresence>

          <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
            <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col z-[150] border-none shadow-elevated">
              {productDetails && (
                <>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="relative aspect-square">
                      <img 
                        src={productDetails.image_url} 
                        alt={productDetails.name}
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => toggleWishlist(productDetails)}
                        className={`absolute top-4 right-4 p-3 rounded-full shadow-elevated transition-all ${
                          isInWishlist(productDetails.id)
                            ? 'bg-primary text-white'
                            : 'bg-white/80 backdrop-blur-md hover:bg-primary hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(productDetails.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-8 space-y-6">
                      <SheetHeader className="space-y-3">
                        <Badge variant="outline" className="w-fit text-[9px] uppercase tracking-widest text-primary border-primary">
                          {productDetails.category_id}
                        </Badge>
                        <SheetTitle className="text-2xl font-bold leading-tight text-left text-charcoal">
                          {productDetails.name}
                        </SheetTitle>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(productDetails.price)}
                          </span>
                          {productDetails.original_price && (
                            <span className="text-lg text-muted-foreground line-through">
                              {formatPrice(productDetails.original_price)}
                            </span>
                          )}
                        </div>
                      </SheetHeader>

                      <SheetDescription className="text-sm md:text-base text-muted-foreground leading-relaxed text-left border-t border-border/40 pt-6">
                        {productDetails.description || 'Sản phẩm nội thất cao cấp với thiết kế tinh xảo, chất liệu thượng hạng giúp nâng tầm không gian sống của bạn.'}
                      </SheetDescription>
                    </div>
                  </div>

                  <div className="p-6 border-t border-border/40 bg-card sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 text-xs font-bold uppercase tracking-widest border-charcoal/20" asChild onClick={() => setSelectedProductId(null)}>
                        <Link to={`/san-pham/${productDetails.id}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                      <Button 
                        className="flex-[1.5] btn-hero h-14 text-xs font-bold shadow-gold"
                        onClick={() => {
                          addToCart({
                            id: productDetails.id,
                            name: productDetails.name,
                            price: productDetails.price,
                            image: productDetails.image_url,
                            quantity: 1
                          });
                          setSelectedProductId(null);
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Thêm vào giỏ
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
}