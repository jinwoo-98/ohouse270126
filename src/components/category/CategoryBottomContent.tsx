"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ArrowRight, Sparkles, ShoppingBag, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

interface CategoryBottomContentProps {
  categoryId?: string;
  categorySlug?: string;
  seoContent?: string;
  isParentCategory?: boolean;
}

export function CategoryBottomContent({ categoryId, categorySlug, seoContent, isParentCategory }: CategoryBottomContentProps) {
  const { addToCart } = useCart();
  const [keywords, setKeywords] = useState<any[]>([]);
  const [shopLooks, setShopLooks] = useState<any[]>([]);
  const [selectedLook, setSelectedLook] = useState<any>(null);

  useEffect(() => {
    if (categoryId) {
      fetchKeywords();
      if (!isParentCategory && categorySlug) {
        fetchLooks();
      }
    }
  }, [categoryId, categorySlug, isParentCategory]);

  const fetchKeywords = async () => {
    const { data } = await supabase
      .from('trending_keywords')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .limit(10);
    setKeywords(data || []);
  };

  const fetchLooks = async () => {
    const { data } = await supabase
      .from('shop_looks')
      .select(`
        *,
        shop_look_items (
          *,
          products:product_id (*)
        )
      `)
      .eq('category_id', categorySlug)
      .eq('is_active', true)
      .limit(4);
    setShopLooks(data || []);
  };

  return (
    <div className="space-y-16 mt-16 pb-12">
      {/* 1. Trending Keywords */}
      {keywords.length > 0 && (
        <section className="py-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Xu Hướng Tìm Kiếm</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 flex-1">
              {keywords.map((item) => (
                <Link
                  key={item.id}
                  to={`/tim-kiem?q=${encodeURIComponent(item.keyword)}`}
                  className="px-4 py-2 bg-secondary/30 hover:bg-primary hover:text-primary-foreground border border-border/50 rounded-full text-xs font-medium transition-all duration-300"
                >
                  {item.keyword}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Shop The Look (Landscape Style) */}
      {!isParentCategory && shopLooks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-charcoal">Cảm Hứng Thiết Kế</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shopLooks.map((look, idx) => (
              <motion.div 
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col gap-4"
              >
                {/* Landscape Image */}
                <div 
                  className="relative aspect-video rounded-[24px] overflow-hidden cursor-pointer shadow-medium group-hover:shadow-elevated transition-all duration-500"
                  onClick={() => setSelectedLook(look)}
                >
                  <img 
                    src={look.image_url} 
                    alt={look.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  
                  {/* Badge Label */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-charcoal/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      Look #{idx + 1}
                    </span>
                  </div>

                  {/* Quick Dots Preview */}
                  {look.shop_look_items?.map((item: any, i: number) => (
                    <div 
                      key={i}
                      className="absolute w-3 h-3 bg-white border border-primary rounded-full shadow-gold animate-pulse"
                      style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                    />
                  ))}
                </div>

                {/* Footer Info & Action */}
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="font-bold text-charcoal text-lg group-hover:text-primary transition-colors">{look.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{look.shop_look_items?.length || 0} sản phẩm trong ảnh</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6 h-10 text-[10px] font-bold uppercase tracking-widest border-charcoal/20 hover:bg-charcoal hover:text-white shadow-sm"
                    onClick={() => setSelectedLook(look)}
                  >
                    Xem ngay +
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SEO Content */}
      {seoContent && (
        <section className="bg-white p-8 md:p-12 rounded-[40px] border border-border/60 shadow-subtle">
          <div 
            className="rich-text-content prose prose-stone max-w-none text-muted-foreground prose-headings:text-charcoal prose-a:text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: seoContent }} 
          />
        </section>
      )}

      {/* Look Detail Sheet */}
      <Sheet open={!!selectedLook} onOpenChange={(open) => !open && setSelectedLook(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col z-[150] border-none shadow-elevated">
          {selectedLook && (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Look Image with hotspots */}
                <div className="relative aspect-[4/5] bg-secondary/20">
                  <img src={selectedLook.image_url} className="w-full h-full object-cover" alt={selectedLook.title} />
                  <div className="absolute inset-0 bg-black/10" />
                  
                  {selectedLook.shop_look_items?.map((item: any, i: number) => (
                    <div 
                      key={i}
                      className="absolute w-8 h-8 -ml-4 -mt-4 bg-white/90 backdrop-blur-sm rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-sm shadow-gold group/dot cursor-pointer transition-transform hover:scale-110"
                      style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                    >
                      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      +
                    </div>
                  ))}
                </div>

                <div className="p-8">
                  <SheetHeader className="mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Shop The Look</span>
                    <SheetTitle className="text-2xl font-bold text-charcoal uppercase tracking-widest text-left">
                      {selectedLook.title}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-3">Sản phẩm trong ảnh</h4>
                    
                    <div className="grid gap-4">
                      {selectedLook.shop_look_items?.map((item: any) => (
                        <div key={item.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-white transition-all shadow-sm">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-border/40 shrink-0">
                            <img src={item.products?.image_url} alt={item.products?.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-charcoal truncate group-hover:text-primary transition-colors">{item.products?.name}</h5>
                            <p className="text-primary font-bold text-base mt-1">{formatPrice(item.products?.price)}</p>
                            <Link to={`/san-pham/${item.products?.slug}`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mt-2 inline-block">Xem chi tiết →</Link>
                          </div>
                          <Button 
                            size="icon" 
                            className="w-10 h-10 rounded-full shadow-gold"
                            onClick={() => {
                              addToCart({
                                id: item.products.id,
                                name: item.products.name,
                                price: item.products.price,
                                image: item.products.image_url,
                                quantity: 1,
                                slug: item.products.slug
                              });
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card border-t border-border/40 sticky bottom-0">
                <Button className="w-full btn-hero h-14 rounded-2xl shadow-gold" onClick={() => setSelectedLook(null)}>
                  TIẾP TỤC KHÁM PHÁ
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}