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
import { ScrollArea } from "@/components/ui/scroll-area";
import { LookProductHorizontalScroll } from "@/components/inspiration/LookProductHorizontalScroll";
import { LookProductVerticalItem } from "@/components/inspiration/LookProductVerticalItem";
import { useLookbookSimilarProducts } from "@/hooks/useLookbookSimilarProducts"; // NEW IMPORT
import { ProductHorizontalScroll } from "@/components/product/ProductHorizontalScroll"; // Sử dụng lại component cuộn ngang

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
  
  const lookbookProducts = useMemo(() => visibleItems.map((item: any) => item.products).filter(Boolean), [visibleItems]);

  // NEW: Hook để lấy sản phẩm tương tự
  const { 
    similarProducts, 
    categories, 
    isLoading: isLoadingSimilar, 
    setActiveCategorySlug, 
    activeCategorySlug 
  } = useLookbookSimilarProducts(lookbookProducts);

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
          {/* 1. Title and Description Section (Full Width) */}
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

          {/* 2. Main Content Grid (Gallery + Product List) */}
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            
            {/* LEFT: Gallery (2/3 width) */}
            <div className="lg:col-span-2 min-w-0 w-full overflow-hidden">
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

            {/* RIGHT: Product List (1/3 width) - DESKTOP ONLY */}
            {visibleItems.length > 0 && (
              <div className="hidden lg:block lg:col-span-1 min-w-0 w-full">
                <h2 className="text-xl font-bold mb-6 text-charcoal uppercase tracking-widest">Sản phẩm trong không gian</h2>
                
                {/* Compact Vertical List with ScrollArea */}
                <ScrollArea className="h-[70vh] max-h-[70vh] pr-4">
                  <div className="grid grid-cols-2 gap-4"> {/* Sử dụng grid 2 cột để tối ưu khoảng trống */}
                    {visibleItems.map((item: any, index: number) => {
                      const product = item.products;
                      
                      return (
                        <LookProductVerticalItem 
                          key={item.id} 
                          product={product} 
                          onQuickView={setQuickViewProduct} 
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
                
                {/* CTA to add all to cart - DESKTOP */}
                <Button 
                  onClick={() => {
                    visibleItems.forEach((item: any) => addToCart({ ...item.products, quantity: 1, image: item.products.image_url }));
                    toast.success(`Đã thêm ${visibleItems.length} sản phẩm vào giỏ hàng.`);
                  }}
                  className="w-full btn-hero h-12 text-xs font-bold shadow-gold mt-6 rounded-2xl"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Thêm tất cả vào giỏ
                </Button>
              </div>
            )}
          </div>
          
          {/* NEW: Product List - MOBILE ONLY (Horizontal Scroll) */}
          {visibleItems.length > 0 && (
            <div className="lg:hidden mt-8">
              <h2 className="text-xl font-bold mb-6 text-charcoal uppercase tracking-widest">Sản phẩm trong không gian</h2>
              <LookProductHorizontalScroll products={lookbookProducts} onQuickView={setQuickViewProduct} />
              
              {/* CTA to add all to cart - MOBILE */}
              <Button 
                onClick={() => {
                  visibleItems.forEach((item: any) => addToCart({ ...item.products, quantity: 1, image: item.products.image_url }));
                  toast.success(`Đã thêm ${visibleItems.length} sản phẩm vào giỏ hàng.`);
                }}
                className="w-full btn-hero h-12 text-xs font-bold shadow-gold mt-4 rounded-2xl"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Thêm tất cả vào giỏ
              </Button>
            </div>
          )}
          
          {/* 3. Sản phẩm tương tự (NEW SECTION) */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-charcoal">Sản Phẩm Tương Tự</h2>
            
            {/* Category Tabs/Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Button
                variant={activeCategorySlug === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategorySlug('all')}
                className={cn(
                  "h-10 rounded-2xl px-6 text-xs font-bold uppercase tracking-widest",
                  activeCategorySlug === 'all' ? "btn-hero shadow-gold" : "border-border/60 hover:bg-secondary/50"
                )}
              >
                Tất Cả ({lookbookProducts.length})
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.slug}
                  variant={activeCategorySlug === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={cn(
                    "h-10 rounded-2xl px-6 text-xs font-bold uppercase tracking-widest",
                    activeCategorySlug === cat.slug ? "btn-hero shadow-gold" : "border-border/60 hover:bg-secondary/50"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            
            {/* Similar Products List */}
            {isLoadingSimilar ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : similarProducts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic">Không tìm thấy sản phẩm tương tự trong danh mục này.</div>
            ) : (
              <ProductHorizontalScroll 
                products={similarProducts} 
                title="" // Bỏ tiêu đề vì đã có tiêu đề chính
                onQuickView={setQuickViewProduct} 
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}