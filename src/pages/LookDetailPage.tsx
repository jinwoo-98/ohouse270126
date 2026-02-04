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
import { useLookbookSimilarProducts } from "@/hooks/useLookbookSimilarProducts";
import { ProductHorizontalScroll } from "@/components/product/ProductHorizontalScroll";
import { useSimilarLookbooks } from "@/hooks/useSimilarLookbooks";
import { SimilarLookbooks } from "@/components/inspiration/SimilarLookbooks";
import { LookbookCTAFilters } from "@/components/inspiration/LookbookCTAFilters";
import { LookProductList } from "@/components/inspiration/LookProductList"; // Danh sách dọc tối giản (Sidebar)
import { LookProductVerticalList } from "@/components/inspiration/LookProductFullList"; // Danh sách lưới thẻ đầy đủ (Sản phẩm tương tự)

export default function LookDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [look, setLook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>("");

  useEffect(() => {
    if (slug) {
      fetchLook();
    }
  }, [slug]);

  const fetchLook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_looks')
        .select('*, shop_look_items(*, products(*))')
        .or(`slug.eq.${slug},id.eq.${slug}`) // **FIX: Query by slug OR id**
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        toast.error("Không tìm thấy không gian thiết kế này.");
        navigate("/cam-hung");
        return;
      }
      setLook(data);
      setCurrentImage(data.image_url);
    } catch (e) {
      console.error("Error fetching lookbook:", e);
      toast.error("Lỗi tải trang chi tiết Lookbook.");
      navigate("/cam-hung");
    } finally {
      setLoading(false);
    }
  };

  const visibleItems = useMemo(() => {
    if (!look) return [];
    return look.shop_look_items.filter((item: any) => item.products);
  }, [look]);
  
  const lookbookProducts = useMemo(() => visibleItems.map((item: any) => item.products).filter(Boolean), [visibleItems]);

  const lookHotspots = useMemo(() => {
    if (!look?.shop_look_items) return [];
    return look.shop_look_items
      .filter((item: any) => item.products)
      .map((item: any) => ({
        id: item.id,
        x_position: item.x_position,
        y_position: item.y_position,
        target_image_url: item.target_image_url,
        product: item.products,
      }));
  }, [look]);

  const { 
    similarProducts, 
    categories, 
    isLoading: isLoadingSimilar, 
    setActiveCategorySlug, 
    activeCategorySlug 
  } = useLookbookSimilarProducts(lookbookProducts);
  
  const { similarLookbooks, isLoadingSimilarLooks } = useSimilarLookbooks(
    look?.id, 
    look?.category_id
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!look) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-charcoal">{look.title}</h1>
            <p className="text-muted-foreground">
              {`Khám phá ${visibleItems.length} sản phẩm trong không gian này và thêm vào giỏ hàng của bạn.`}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            <div className="lg:col-span-2 min-w-0 w-full overflow-hidden">
              <ProductGallery 
                mainImage={look.image_url} 
                galleryImages={look.gallery_urls} 
                productName={look.title} 
                hotspots={lookHotspots}
                onHotspotClick={setQuickViewProduct}
              >
                {(currentImageUrl) => {
                  useEffect(() => {
                    setCurrentImage(currentImageUrl);
                  }, [currentImageUrl]);
                  return null;
                }}
              </ProductGallery>
            </div>

            {visibleItems.length > 0 && (
              <div className="lg:col-span-1 min-w-0 w-full hidden lg:block">
                <LookProductList products={lookbookProducts} onQuickView={setQuickViewProduct} />
              </div>
            )}
          </div>
          
          {visibleItems.length > 0 && (
            <div className="mt-12 lg:hidden">
              <h2 className="text-xl font-bold mb-6 text-charcoal uppercase tracking-widest container-luxury px-0">Sản phẩm trong không gian</h2>
              <LookProductHorizontalScroll products={lookbookProducts} onQuickView={setQuickViewProduct} />
            </div>
          )}
          
          <section className="mt-20">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-charcoal text-center">SẢN PHẨM TƯƠNG TỰ</h2>
            
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
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
            
            {isLoadingSimilar ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : similarProducts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic">Không tìm thấy sản phẩm tương tự trong danh mục này.</div>
            ) : (
              <LookProductVerticalList 
                products={similarProducts} 
                title=""
                onQuickView={setQuickViewProduct} 
              />
            )}
          </section>
          
          {!isLoadingSimilarLooks && similarLookbooks.length > 0 && (
            <SimilarLookbooks lookbooks={similarLookbooks} title="COMBO TƯƠNG TỰ KHÁC" onQuickView={setQuickViewProduct} />
          )}
        </div>
        
        <LookbookCTAFilters />
      </main>
      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}