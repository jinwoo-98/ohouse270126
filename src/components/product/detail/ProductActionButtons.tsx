"use client";

import { useState, useEffect } from "react";
import { Images, Ruler, Sparkles, Loader2, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl, formatPrice } from "@/lib/utils";
import { HorizontalProductCard } from "./HorizontalProductCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductActionButtonsProps {
  product: any;
  onQuickView?: (product: any) => void;
}

export function ProductActionButtons({ product, onQuickView }: ProductActionButtonsProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);
  
  const [lookbook, setLookbook] = useState<any>(null);
  const [loadingLook, setLoadingLook] = useState(false);

  const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);

  const fetchLookbook = async () => {
    if (lookbook) {
      setIsLookbookOpen(true);
      return;
    }

    setLoadingLook(true);
    try {
      // Tìm lookbook chứa sản phẩm này
      const { data: itemData } = await supabase
        .from('shop_look_items')
        .select('look_id')
        .eq('product_id', product.id)
        .limit(1)
        .maybeSingle();

      if (itemData) {
        const { data: lookData } = await supabase
          .from('shop_looks')
          .select(`
            *,
            shop_look_items (
              *,
              products:product_id (*)
            )
          `)
          .eq('id', itemData.look_id)
          .single();
        
        setLookbook(lookData);
        setIsLookbookOpen(true);
      } else {
        // Nếu không có lookbook cụ thể, tìm lookbook cùng danh mục
        const { data: catLook } = await supabase
          .from('shop_looks')
          .select(`
            *,
            shop_look_items (
              *,
              products:product_id (*)
            )
          `)
          .eq('category_id', product.category_id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        
        if (catLook) {
          setLookbook(catLook);
          setIsLookbookOpen(true);
        } else {
          // Thông báo nếu không tìm thấy cảm hứng nào
          alert("Hiện chưa có không gian phối đồ mẫu cho sản phẩm này.");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLook(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <Button 
        variant="outline" 
        onClick={() => setIsMediaOpen(true)}
        className="h-11 px-5 rounded-xl border-border/60 bg-white hover:bg-secondary/50 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm"
      >
        <Images className="w-4 h-4 text-primary" /> Toàn bộ media
      </Button>

      {product.dimension_image_url && (
        <Button 
          variant="outline" 
          onClick={() => setIsDimensionsOpen(true)}
          className="h-11 px-5 rounded-xl border-border/60 bg-white hover:bg-secondary/50 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm"
        >
          <Ruler className="w-4 h-4 text-primary" /> Kích thước
        </Button>
      )}

      <Button 
        variant="outline" 
        onClick={fetchLookbook}
        disabled={loadingLook}
        className="h-11 px-5 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm"
      >
        {loadingLook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Phối đồ Lookbook
      </Button>

      {/* 1. Dialog Toàn bộ Media */}
      <Dialog open={isMediaOpen} onOpenChange={setIsMediaOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden border-none rounded-[32px] shadow-elevated z-[160]">
          <div className="bg-charcoal p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <Images className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold uppercase tracking-widest">Thư Viện Hình Ảnh</DialogTitle>
            </div>
            <button onClick={() => setIsMediaOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {allImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border/40 bg-secondary/10 group">
                  <img 
                    src={getOptimizedImageUrl(img, { width: 600 })} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={`${product.name} - ${idx + 1}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Dialog Kích thước */}
      <Dialog open={isDimensionsOpen} onOpenChange={setIsDimensionsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[32px] shadow-elevated z-[160]">
          <div className="bg-charcoal p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <Ruler className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold uppercase tracking-widest">Thông Số Kích Thước</DialogTitle>
            </div>
            <button onClick={() => setIsDimensionsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 bg-white flex items-center justify-center">
            <div className="rounded-2xl overflow-hidden border border-border/40 shadow-subtle max-w-full">
              <img src={product.dimension_image_url} alt="Kích thước sản phẩm" className="max-w-full h-auto" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Dialog Lookbook */}
      <Dialog open={isLookbookOpen} onOpenChange={setIsLookbookOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none rounded-[32px] shadow-elevated z-[160] [&>button]:hidden">
          {lookbook && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left: Lookbook Image with Hotspots */}
              <div className="flex-1 relative bg-secondary/20 min-h-[300px] md:min-h-0">
                <img src={lookbook.image_url} className="w-full h-full object-cover" alt={lookbook.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent pointer-events-none" />
                
                <div className="absolute top-6 left-8 z-20">
                  <Badge className="bg-primary text-white border-none uppercase tracking-widest text-[10px] px-4 py-1.5 shadow-gold">
                    Cảm hứng không gian
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 drop-shadow-md uppercase tracking-tight">
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
                          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-30 group/dot"
                          style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                          onClick={() => onQuickView?.(item.products)}
                        >
                          <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
                          <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-charcoal text-white border-none p-3 rounded-xl shadow-elevated">
                        <p className="font-bold text-[10px] uppercase tracking-wider">{item.products.name}</p>
                        <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              {/* Right: Product List */}
              <div className="w-full md:w-[400px] bg-white flex flex-col border-l border-border/40">
                <div className="p-6 border-b border-border/40 flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-charcoal">Sản phẩm trong ảnh</h3>
                  <button onClick={() => setIsLookbookOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-secondary/5">
                  {lookbook.shop_look_items
                    ?.filter((item: any) => item.products)
                    .map((item: any) => (
                    <HorizontalProductCard 
                      key={item.id} 
                      product={item.products} 
                      onClose={() => setIsLookbookOpen(false)} 
                    />
                  ))}
                </div>
                <div className="p-6 bg-white border-t border-border/40">
                  <Button className="w-full btn-hero h-12 rounded-xl shadow-gold text-[10px] font-bold" asChild>
                    <a href={`/y-tuong/${lookbook.slug || lookbook.id}`}>XEM CHI TIẾT KHÔNG GIAN</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}