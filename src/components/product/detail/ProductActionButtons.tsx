"use client";

import { useState, useEffect, useMemo } from "react";
import { Images, Ruler, Sparkles, Loader2, X, PlayCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl, formatPrice, cn } from "@/lib/utils";
import { HorizontalProductCard } from "./HorizontalProductCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ProductActionButtonsProps {
  product: any;
  reviews: any[];
  onQuickView?: (product: any) => void;
}

type TabType = 'media' | 'video' | 'dimensions' | 'lookbook' | 'customer_photos';

export function ProductActionButtons({ product, reviews, onQuickView }: ProductActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('media');
  
  const [lookbook, setLookbook] = useState<any>(null);
  const [loadingLook, setLoadingLook] = useState(false);
  const [hasCheckedLookbook, setHasCheckedLookbook] = useState(false);

  const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);
  const customerImages = useMemo(() => reviews.filter(r => r.image_url).map(r => ({ url: r.image_url, user: r.user_name })), [reviews]);

  // Kiểm tra sự tồn tại của Lookbook khi component mount để quyết định ẩn/hiện nút
  useEffect(() => {
    const checkLookbook = async () => {
      try {
        const { data: itemData } = await supabase
          .from('shop_look_items')
          .select('look_id')
          .eq('product_id', product.id)
          .limit(1)
          .maybeSingle();

        if (itemData) {
          const { data: lookData } = await supabase
            .from('shop_looks')
            .select(`*, shop_look_items (*, products:product_id (*))`)
            .eq('id', itemData.look_id)
            .single();
          setLookbook(lookData);
        } else {
          const { data: catLook } = await supabase
            .from('shop_looks')
            .select(`*, shop_look_items (*, products:product_id (*))`)
            .eq('category_id', product.category_id)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
          if (catLook) setLookbook(catLook);
        }
      } catch (e) {
        console.error("Error checking lookbook:", e);
      } finally {
        setHasCheckedLookbook(true);
      }
    };
    checkLookbook();
  }, [product.id, product.category_id]);

  const tabs = useMemo(() => {
    const items = [
      { id: 'media' as TabType, label: "Toàn bộ media", icon: Images, show: true },
      { id: 'video' as TabType, label: "Video", icon: PlayCircle, show: !!product.video_url },
      { id: 'dimensions' as TabType, label: "Thông số kích thước", icon: Ruler, show: !!product.dimension_image_url },
      { id: 'lookbook' as TabType, label: "Phối đồ Lookbook", icon: Sparkles, show: !!lookbook },
      { id: 'customer_photos' as TabType, label: "Hình ảnh khách hàng", icon: Camera, show: customerImages.length > 0 },
    ];
    return items.filter(t => t.show);
  }, [product, lookbook, customerImages]);

  const uniqueLookbookProducts = useMemo(() => {
    if (!lookbook?.shop_look_items) return [];
    const seen = new Set();
    return lookbook.shop_look_items
      .filter((item: any) => {
        if (!item.products) return false;
        const pid = item.products.id || item.product_id;
        if (seen.has(pid)) return false;
        seen.add(pid);
        return true;
      })
      .map((item: any) => item.products);
  }, [lookbook]);

  const handleOpenTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {tabs.map((tab) => (
        <Button 
          key={tab.id}
          variant="outline" 
          onClick={() => handleOpenTab(tab.id)}
          className={cn(
            "h-10 px-5 rounded-xl border-border/60 bg-white hover:bg-secondary/50 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm transition-all",
            tab.id === 'lookbook' && "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
          )}
        >
          <tab.icon className="w-4 h-4" /> {tab.label}
        </Button>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[1700px] w-[95vw] h-[983px] max-h-[95vh] p-0 overflow-hidden border-none rounded-[32px] shadow-elevated z-[160] flex flex-col [&>button]:hidden">
          {/* Header: 64px */}
          <div className="h-[64px] bg-charcoal flex items-center justify-between px-8 shrink-0 border-b border-white/10">
            <div className="flex items-center h-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "h-full px-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative group",
                    activeTab === tab.id ? "text-primary" : "text-white/60 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content: 919px */}
          <div className="flex-1 h-[919px] bg-white overflow-hidden">
            {activeTab === 'media' && (
              <div className="h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                  {allImages.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-border/40 bg-secondary/10 group shadow-sm">
                      <img 
                        src={getOptimizedImageUrl(img, { width: 800 })} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt={`${product.name} - ${idx + 1}`} 
                        onError={(e) => { (e.target as HTMLImageElement).src = img; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="h-full flex items-center justify-center p-12 bg-black">
                <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe 
                    src={product.video_url?.replace('watch?v=', 'embed/')} 
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {activeTab === 'dimensions' && (
              <div className="h-full flex items-center justify-center p-12 bg-secondary/5">
                <div className="max-w-4xl w-full bg-white p-4 rounded-[32px] shadow-medium border border-border/40 relative overflow-hidden">
                  <img 
                    src={product.dimension_image_url} 
                    alt="Kích thước sản phẩm" 
                    className="w-full h-auto object-contain" 
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {activeTab === 'lookbook' && (
              <div className="h-full flex flex-col md:flex-row">
                {lookbook ? (
                  <>
                    <div className="flex-1 relative bg-secondary/20">
                      <img src={lookbook.image_url} className="w-full h-full object-cover" alt={lookbook.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent pointer-events-none" />
                      
                      <div className="absolute top-8 left-10 z-20">
                        <Badge className="bg-primary text-white border-none uppercase tracking-widest text-[10px] px-4 py-1.5 shadow-gold">
                          Cảm hứng không gian
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 drop-shadow-md uppercase tracking-tight">
                          {lookbook.title}
                        </h2>
                      </div>

                      <TooltipProvider>
                        {lookbook.shop_look_items
                          ?.filter((item: any) => item.target_image_url === lookbook.image_url && item.products)
                          .map((item: any) => (
                          <Tooltip key={item.id} delayDuration={0}>
                            <TooltipTrigger asChild>
                              <button
                                className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-30 group/dot"
                                style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                                onClick={() => onQuickView?.(item.products)}
                              >
                                <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
                                <span className="relative w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-charcoal text-white border-none p-4 rounded-2xl shadow-elevated">
                              <p className="font-bold text-xs uppercase tracking-wider">{item.products.name}</p>
                              <p className="text-primary font-bold text-sm mt-1">{formatPrice(item.products.price)}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>

                    <div className="w-full md:w-[450px] bg-white flex flex-col border-l border-border/40">
                      <div className="p-8 border-b border-border/40">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-charcoal">Sản phẩm trong ảnh</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">{uniqueLookbookProducts.length} sản phẩm phối hợp</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-secondary/5">
                        {uniqueLookbookProducts.map((p: any) => (
                          <HorizontalProductCard 
                            key={p.id} 
                            product={p} 
                            onClose={() => setIsOpen(false)} 
                          />
                        ))}
                      </div>
                      <div className="p-8 bg-white border-t border-border/40">
                        <Button className="w-full btn-hero h-14 rounded-2xl shadow-gold text-xs font-bold" asChild>
                          <a href={`/y-tuong/${lookbook.slug || lookbook.id}`}>XEM CHI TIẾT KHÔNG GIAN</a>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <Sparkles className="w-16 h-16 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground italic">Hiện chưa có không gian phối đồ mẫu cho sản phẩm này.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'customer_photos' && (
              <div className="h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {customerImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-border/40 bg-secondary/10 group shadow-sm">
                      <img 
                        src={getOptimizedImageUrl(img.url, { width: 600 })} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt={`Feedback từ ${img.user}`} 
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] font-bold uppercase tracking-widest">Khách hàng: {img.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}