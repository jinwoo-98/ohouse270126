"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Sparkles, ShoppingBag, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QuickViewSheet } from "@/components/QuickViewSheet";

interface CategoryBottomContentProps {
  categoryId?: string;
  categorySlug?: string;
  seoContent?: string;
  isParentCategory?: boolean;
  parentSlug?: string;
}

export function CategoryBottomContent({ categoryId, categorySlug, seoContent, isParentCategory, parentSlug }: CategoryBottomContentProps) {
  const { addToCart } = useCart();
  const [keywords, setKeywords] = useState<any[]>([]);
  const [shopLooks, setShopLooks] = useState<any[]>([]);
  const [selectedLook, setSelectedLook] = useState<any>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    if (categoryId) {
      fetchKeywords();
      fetchLooks();
    }
  }, [categoryId, categorySlug, isParentCategory, parentSlug]);

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
    let slugsToQuery: string[] = [];
    
    if (categorySlug) {
      slugsToQuery.push(categorySlug);
    }

    if (!isParentCategory && parentSlug) {
      slugsToQuery.push(parentSlug);
    }
    
    if (slugsToQuery.length === 0) return;

    const { data } = await supabase
      .from('shop_looks')
      .select(`
        *,
        slug,
        shop_look_items (
          *,
          products:product_id (*)
        )
      `)
      .in('category_id', slugsToQuery)
      .eq('is_active', true)
      .limit(4);
      
    const uniqueLooks = (data || [])
      .filter((look, index, self) => 
        index === self.findIndex((l) => l.id === look.id)
      );
    
    setShopLooks(uniqueLooks);
  };

  return (
    <div className="space-y-16 mt-16 pb-12">
      {keywords.length > 0 && (
        <section className="py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">Xu Hướng Tìm Kiếm</h2>
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

      {shopLooks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-10">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-charcoal">Cảm Hứng Thiết Kế</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {shopLooks.map((look, idx) => {
              const detailLink = `/y-tuong/${look.slug || look.id}`;
              return (
                <motion.div 
                  key={look.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex flex-col"
                >
                  <div 
                    className="relative aspect-video rounded-[32px] overflow-hidden cursor-pointer shadow-medium group-hover:shadow-elevated transition-all duration-500"
                    onClick={() => setSelectedLook(look)}
                  >
                    <Link to={detailLink} className="absolute inset-0 z-10">
                      <img src={look.image_url} alt={look.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                    </Link>
                    
                    <TooltipProvider>
                      {look.shop_look_items
                        .filter((item: any) => item.target_image_url === look.image_url && item.products)
                        .map((item: any, i: number) => (
                        <Tooltip key={i} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-20 group/dot pointer-events-auto"
                              style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (item.products) setQuickViewProduct(item.products);
                              }}
                            >
                              <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
                              <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
                            </button>
                          </TooltipTrigger>
                          {item.products && (
                            <TooltipContent className="bg-charcoal text-cream border-none p-3 rounded-xl shadow-elevated">
                              <p className="font-bold text-[10px] uppercase tracking-wider">{item.products.name}</p>
                              <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>

                  <div className="flex items-start justify-between p-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-charcoal text-lg group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {look.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">{look.shop_look_items?.length || 0} sản phẩm phối hợp</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-xl px-4 h-10 text-[9px] font-bold uppercase tracking-widest border-charcoal/20 hover:bg-charcoal hover:text-white shadow-sm shrink-0"
                      asChild
                    >
                      <Link to={detailLink}>
                        XEM NGAY +
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {seoContent && (
        <section className="py-12 border-t border-border/40">
          <div 
            className="rich-text-content prose prose-stone max-w-none text-muted-foreground prose-headings:text-charcoal prose-a:text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: seoContent }} 
          />
        </section>
      )}

      <Sheet open={!!selectedLook} onOpenChange={(open) => !open && setSelectedLook(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col z-[150] border-none shadow-elevated">
          {selectedLook && (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                <div className="relative aspect-[4/3] bg-secondary/20">
                  <img src={selectedLook.image_url} className="w-full h-full object-cover" alt={selectedLook.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                     <SheetHeader>
                        <Badge className="w-fit mb-3 bg-primary text-white border-none uppercase tracking-widest text-[9px]">OHOUSE Inspiration</Badge>
                        <SheetTitle className="text-2xl font-bold text-white uppercase tracking-widest text-left leading-tight">
                          {selectedLook.title}
                        </SheetTitle>
                        <SheetDescription className="text-cream/80 text-xs font-medium uppercase tracking-widest mt-2">
                           {selectedLook.shop_look_items?.length || 0} Sản phẩm trong không gian này
                        </SheetDescription>
                     </SheetHeader>
                  </div>
                </div>

                <div className="p-8">
                  <div className="space-y-6">
                    {selectedLook.shop_look_items?.map((item: any) => (
                      <div key={item.id} className="group flex items-center gap-5 p-4 rounded-[24px] bg-white border border-border/40 hover:border-primary/30 transition-all shadow-subtle">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary/30 shrink-0 border border-border/20">
                           <img src={item.products?.image_url} alt={item.products?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h5 className="font-bold text-sm text-charcoal truncate mb-1">{item.products?.name}</h5>
                          <p className="text-primary font-bold text-lg">{formatPrice(item.products?.price)}</p>
                          
                          <div className="mt-4 flex gap-2">
                             <Button 
                                size="sm" 
                                className="flex-1 btn-hero h-10 text-[9px] font-bold shadow-none rounded-lg"
                                onClick={() => addToCart({ ...item.products, quantity: 1, image: item.products.image_url })}
                             >
                               <ShoppingBag className="w-3.5 h-3.5 mr-2" /> THÊM VÀO GIỎ
                             </Button>
                             <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-lg border-border/60 hover:bg-secondary"
                                asChild
                             >
                               <Link to={`/san-pham/${item.products?.slug}`}><ChevronRight className="w-4 h-4" /></Link>
                             </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white border-t border-border/40 sticky bottom-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                <Button className="w-full btn-hero h-14 rounded-2xl shadow-gold text-xs font-bold" onClick={() => setSelectedLook(null)}>TIẾP TỤC MUA SẮM</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <QuickViewSheet 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
}