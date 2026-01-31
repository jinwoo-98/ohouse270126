import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, ChevronRight, Plus, ShoppingBag, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductGallery } from "@/components/product/ProductGallery";

export default function LookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [look, setLook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>(""); // State để theo dõi ảnh đang hiển thị

  useEffect(() => {
    if (id) {
      fetchLook();
    }
  }, [id]);

  const fetchLook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_looks')
        .select('*, shop_look_items(*, products(*))')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error("Không tìm thấy không gian thiết kế này.");
        navigate("/cam-hung");
        return;
      }
      setLook(data);
      setCurrentImage(data.image_url); // Đặt ảnh chính làm ảnh mặc định
    } finally {
      setLoading(false);
    }
  };

  const visibleItems = useMemo(() => {
    if (!look) return [];
    // Hiển thị tất cả sản phẩm có trong look, không lọc theo ảnh
    return look.shop_look_items.filter((item: any) => item.products);
  }, [look]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!look) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary/50 py-3 border-b border-border/40">
          <div className="container-luxury flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/cam-hung" className="hover:text-primary transition-colors">Cảm hứng</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{look.title}</span>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image with Hotspots (Using ProductGallery for main image and thumbnails) */}
            <div className="min-w-0 w-full overflow-hidden">
              <ProductGallery 
                mainImage={look.image_url} 
                galleryImages={look.gallery_urls} 
                productName={look.title} 
              >
                {(currentImageUrl) => {
                  // Cập nhật currentImage khi ProductGallery thay đổi ảnh
                  useEffect(() => {
                    setCurrentImage(currentImageUrl);
                  }, [currentImageUrl]);

                  return (
                    <TooltipProvider>
                      {look.shop_look_items
                        .filter((item: any) => item.target_image_url === currentImageUrl)
                        .map((item: any) => {
                          const product = item.products;
                          if (!product) return null;

                          return (
                            <Tooltip key={item.id} delayDuration={0}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                  // Thiết kế Hotspot mới
                                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-10 group/dot pointer-events-auto"
                                  style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                                >
                                  {/* Vòng tròn ngoài (Ping effect) */}
                                  <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
                                  {/* Vòng tròn trong (Hotspot chính) */}
                                  <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-charcoal text-cream border-none p-3 shadow-elevated rounded-xl">
                                <p className="font-bold text-xs uppercase tracking-wider">{product.name}</p>
                                <p className="text-primary font-bold text-xs mt-1">{formatPrice(product.price)}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                      })}
                    </TooltipProvider>
                  );
                }}
              </ProductGallery>
            </div>

            {/* Right: Product List */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{look.title}</h1>
              <p className="text-muted-foreground mb-8">
                {`Khám phá ${visibleItems.length} sản phẩm trong không gian này và thêm vào giỏ hàng của bạn.`}
              </p>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="grid grid-cols-2 gap-4">
                  {visibleItems.map((item: any, index: number) => {
                    const product = item.products;
                    
                    return (
                      <motion.div 
                        key={item.id} 
                        className="group card-luxury cursor-pointer"
                        onClick={() => setQuickViewProduct(product)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="relative aspect-square img-zoom">
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="p-3 text-center">
                          <h3 className="text-xs font-bold line-clamp-1 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                          <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {visibleItems.length === 0 && (
                    <div className="col-span-2 text-center py-10 text-muted-foreground italic">
                      Không có sản phẩm nào được gắn thẻ trong ảnh này.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}