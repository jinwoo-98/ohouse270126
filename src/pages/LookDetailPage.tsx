import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, ChevronRight, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProductGallery } from "@/components/product/ProductGallery";
import { LookProductList } from "@/components/inspiration/LookProductList"; 
import { useLookbookSimilarProducts } from "@/hooks/useLookbookSimilarProducts";
import { useSimilarLookbooks } from "@/hooks/useSimilarLookbooks";
import { SimilarLookbooks } from "@/components/inspiration/SimilarLookbooks";
import { LookbookCTAFilters } from "@/components/inspiration/LookbookCTAFilters";
import { LookProductHorizontalScroll } from "@/components/inspiration/LookProductHorizontalScroll";
import { LookProductVerticalList } from "@/components/inspiration/LookProductFullList";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { sanitizeHtml } from "@/lib/sanitize";

export default function LookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [look, setLook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLook();
    }
  }, [id]);

  const fetchLook = async () => {
    setLoading(true);
    setErrorDetail(null);
    
    const selectQuery = `
      *, 
      slug,
      shop_look_items(
        *, 
        products(id, name, price, image_url, slug, category_id, is_sale, original_price)
      )
    `;

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || "");
      
      let query = supabase.from('shop_looks').select(selectQuery);
      
      if (isUuid) {
        query = query.or(`id.eq.${id},slug.eq.${id}`);
      } else {
        query = query.eq('slug', id);
      }

      const { data: lookData, error } = await query.maybeSingle();

      if (error) {
        console.error("Supabase Error:", error);
        setErrorDetail(error.message);
        return;
      }

      if (!lookData) {
        setErrorDetail("Không tìm thấy dữ liệu cho Lookbook này.");
        return;
      }

      setLook(lookData);
      setCurrentImage(lookData.image_url);

    } catch (e: any) {
      console.error("Critical Error:", e);
      setErrorDetail(e.message);
    } finally {
      setLoading(false);
    }
  };

  const visibleItems = useMemo(() => {
    if (!look) return [];
    return look.shop_look_items?.filter((item: any) => item.products) || [];
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

  if (errorDetail || !look) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-charcoal">Rất tiếc, đã có lỗi xảy ra</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{errorDetail || "Không tìm thấy không gian thiết kế bạn yêu cầu."}</p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
        <Button className="btn-hero" onClick={() => navigate("/cam-hung")}>Về trang Cảm hứng</Button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`${look.title} | Cảm Hứng OHOUSE`}</title>
        <meta name="description" content={look.description?.replace(/<[^>]+>/g, '') || `Khám phá không gian ${look.title} với các sản phẩm nội thất cao cấp từ OHOUSE.`} />
        <meta property="og:title" content={look.title} />
        <meta property="og:image" content={look.image_url} />
        <meta property="og:type" content="website" />
      </Helmet>
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
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto items-start">
              {/* Cột Trái: Mô tả & Gallery */}
              <div className="lg:col-span-2 min-w-0 w-full space-y-8">
                {look.description && (
                  <div className="relative w-full overflow-hidden">
                    {/* Cố định chiều ngang 740px để khớp 1:1 với Editor */}
                    <div className="max-w-[740px]">
                      <div 
                        className={cn(
                          "vn-text-final-fix text-muted-foreground transition-all duration-500 prose prose-sm md:prose-base max-w-none overflow-hidden",
                          !isExpanded ? "max-h-[82px]" : "max-h-none"
                        )}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(look.description) }}
                      />
                    </div>
                    
                    {!isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    )}
                    
                    <div className="mt-2 flex justify-start">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:text-primary/80 transition-colors py-1 px-2 bg-secondary/30 rounded-md"
                      >
                        {isExpanded ? (
                          <>Thu gọn <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Xem thêm nội dung <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="overflow-hidden">
                  <ProductGallery 
                    mainImage={look.image_url} 
                    galleryImages={look.gallery_urls} 
                    productName={look.title} 
                    hotspots={lookHotspots}
                    onHotspotClick={setQuickViewProduct}
                    aspectRatio="aspect-[4/3]"
                  >
                    {(currentImageUrl) => {
                      useEffect(() => {
                        setCurrentImage(currentImageUrl);
                      }, [currentImageUrl]);
                      return null;
                    }}
                  </ProductGallery>
                </div>
              </div>

              {/* Cột Phải: Danh sách sản phẩm */}
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
    </>
  );
}