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
import { formatPrice, cn } from "@/lib/utils";
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
          {/* NEW: Title and Description Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{look.title}</h1>
            <p className="text-muted-foreground">
              {`Khám phá ${visibleItems.length} sản phẩm trong không gian này và thêm vào giỏ hàng của bạn.`}
            </p>
          </motion.div>

          {/* MODIFIED: Main Gallery Section */}
          <div className="max-w-6xl mx-auto mb-16">
            <ProductGallery 
              mainImage={look.image_url} 
              galleryImages={look.gallery_urls} 
              productName={look.title} 
            >
              {(currentImageUrl) => {
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
                                className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-10 group/dot pointer-events-auto"
                                style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                              >
                                <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
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

          {/* NEW: Product List Section */}
          {visibleItems.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center md:text-left">Sản phẩm trong không gian này</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {visibleItems.map((item: any, index: number) => {
                  const product = item.products;
                  const isFavorite = isInWishlist(product.id);
                  
                  return (
                    <motion.div 
                      key={item.id} 
                      className="group card-luxury flex flex-col"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="relative aspect-square img-zoom rounded-2xl overflow-hidden border border-border/40">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, slug: product.slug }); }}
                            className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm", isFavorite ? "bg-primary text-white" : "bg-white/80 text-charcoal hover:bg-primary hover:text-white")}
                            title="Yêu thích"
                          >
                            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                          </button>
                        </div>
                        <div className="absolute inset-x-3 bottom-3 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <Button 
                            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                            className="w-full bg-charcoal/90 backdrop-blur-md text-white py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/10 hover:bg-primary transition-all shadow-lg"
                          >
                            Xem Nhanh
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 text-center flex-1 flex flex-col">
                        <h3 className="text-xs font-bold line-clamp-2 mb-1 group-hover:text-primary transition-colors h-8">{product.name}</h3>
                        <p className="text-primary font-bold text-sm mt-auto">{formatPrice(product.price)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}