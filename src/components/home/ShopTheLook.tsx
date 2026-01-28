import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingBag, ChevronRight, ChevronLeft, ArrowRight, Heart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ShopTheLook() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [looks, setLooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<any>(null);

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    try {
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
      setLooks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId && looks.length > 0) {
      // Find detail in current look items
      const item = looks[currentLookIndex].shop_look_items.find((i: any) => i.product_id === selectedProductId);
      if (item && item.products) {
        setProductDetails(item.products);
      }
    }
  }, [selectedProductId, looks, currentLookIndex]);

  const goToNext = () => setCurrentLookIndex((prev) => (prev + 1) % looks.length);
  const goToPrev = () => setCurrentLookIndex((prev) => (prev - 1 + looks.length) % looks.length);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (looks.length === 0) return null;

  const activeLook = looks[currentLookIndex];

  return (
    <section className="py-10 md:py-24 bg-secondary/20 overflow-hidden">
      <div className="container-luxury">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="section-title mb-2 md:mb-4">Shop The Look</h2>
          <p className="text-muted-foreground text-sm md:text-base">Mua sắm trực tiếp từ những không gian thiết kế ấn tượng</p>
        </div>

        {/* Look Tabs Navigation */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar px-4">
          {looks.map((look, idx) => (
            <button
              key={look.id}
              onClick={() => { setCurrentLookIndex(idx); setSelectedProductId(null); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap ${
                idx === currentLookIndex 
                  ? 'bg-charcoal text-cream border-charcoal' 
                  : 'bg-transparent border-border text-muted-foreground hover:border-charcoal'
              }`}
            >
              {look.title}
            </button>
          ))}
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-background shadow-elevated border border-border/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook.id} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/3] md:aspect-[2/1] w-full" 
            >
              <img
                src={activeLook.image_url}
                alt={activeLook.title}
                className="w-full h-full object-cover"
              />
              
              {/* Product Hotspots */}
              <div className="absolute inset-0 bg-black/5">
                {activeLook.shop_look_items.map((item: any) => (
                  <TooltipProvider key={item.id}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedProductId(selectedProductId === item.product_id ? null : item.product_id)}
                          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/95 shadow-elevated flex items-center justify-center text-primary hover:scale-125 transition-all duration-300 z-10 group"
                          style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                        >
                          <span className="absolute w-full h-full rounded-full bg-white/50 animate-ping opacity-75 group-hover:hidden"></span>
                          <Plus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      {item.products && (
                        <TooltipContent side="top" className="bg-charcoal text-cream border-charcoal p-3 shadow-medium hidden md:block">
                          <p className="font-semibold text-sm">{item.products.name}</p>
                          <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {/* Navigation Arrows */}
              {looks.length > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Product Sheet Detail */}
          <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
            <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col z-[100]">
              {productDetails && (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <div className="relative aspect-square">
                      <img 
                        src={productDetails.image_url} 
                        alt={productDetails.name}
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => toggleWishlist(productDetails)}
                        className={`absolute top-4 right-14 p-2.5 rounded-full shadow-medium transition-all ${
                          isInWishlist(productDetails.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(productDetails.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 pb-24">
                      <SheetHeader className="space-y-2">
                        <SheetTitle className="text-xl md:text-2xl font-bold leading-tight text-left">
                          {productDetails.name}
                        </SheetTitle>
                        <div className="flex items-center gap-3">
                          <span className="text-xl md:text-2xl font-bold text-primary">
                            {formatPrice(productDetails.price)}
                          </span>
                          {productDetails.original_price && (
                            <span className="text-base md:text-lg text-muted-foreground line-through">
                              {formatPrice(productDetails.original_price)}
                            </span>
                          )}
                        </div>
                      </SheetHeader>

                      <SheetDescription className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
                        {productDetails.description || 'Chưa có mô tả chi tiết.'}
                      </SheetDescription>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border bg-card sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 h-12 text-sm font-semibold" asChild onClick={() => setSelectedProductId(null)}>
                        <Link to={`/san-pham/${productDetails.id}`}>
                          Xem Chi Tiết
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button 
                        className="flex-[1.5] btn-hero h-12 text-sm font-bold shadow-gold"
                        onClick={() => addToCart({
                          id: productDetails.id,
                          name: productDetails.name,
                          price: productDetails.price,
                          image: productDetails.image_url,
                          quantity: 1
                        })}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Thêm Vào Giỏ
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