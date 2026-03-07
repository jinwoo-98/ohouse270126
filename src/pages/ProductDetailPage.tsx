import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, Truck, RotateCw, ShieldCheck, CreditCard } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { ProductInfo } from "@/components/product/detail/ProductInfo";
import { ProductHorizontalScroll } from "@/components/product/ProductHorizontalScroll";
import { ProductQnA } from "@/components/product/detail/ProductQnA";
import { ProductDescription } from "@/components/product/detail/ProductDescription";
import { ProductReviews } from "@/components/product/detail/ProductReviews";
import { StickyActionToolbar } from "@/components/product/detail/StickyActionToolbar";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useProductRelations } from "@/hooks/useProductRelations";
import { useSimilarProducts } from "@/hooks/useSimilarProducts";
import { Helmet } from "react-helmet-async";
import { useSeo } from "@/hooks/useSeo";
import { generateProductAltText, generateSKU } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { ProductActionButtons } from "@/components/product/detail/ProductActionButtons";
import { FloatingVideoPlayer } from "@/components/product/detail/FloatingVideoPlayer";
import { FullScreenVideoViewer } from "@/components/product/detail/FullScreenVideoViewer";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [shippingPolicy, setShippingPolicy] = useState("");
  
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isFullScreenVideoOpen, setIsFullScreenVideoOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [activeGallery, setActiveGallery] = useState<{ main: string, thumbs: string[] }>({ main: '', thumbs: [] });
  const [lastSelectedTier, setLastSelectedTier] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const { seo } = useSeo({
    title: product ? `${product.name} | OHOUSE` : undefined,
    description: product?.short_description || undefined,
    image: product?.image_url || undefined,
    type: 'product'
  });

  const { perfectMatch, boughtTogether, isLoadingRelations } = useProductRelations(
    product?.id, 
    product?.category_id, 
    product?.perfect_match_ids || [], 
    product?.bought_together_ids || []
  );
  
  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    perfectMatch.forEach(p => ids.add(p.id));
    boughtTogether.forEach(p => ids.add(p.id));
    return Array.from(ids);
  }, [perfectMatch, boughtTogether]);

  const { similarProducts, isLoadingSimilar } = useSimilarProducts(
    product?.category_id,
    product?.id,
    excludedIds
  );

  useEffect(() => {
    if (slug) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, slug')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      setProduct(data);
      
      // Khởi tạo gallery ban đầu, loại bỏ trùng lặp
      const initialImages = [data.image_url, ...(data.gallery_urls || [])].filter(Boolean);
      const uniqueImages = Array.from(new Set(initialImages));
      
      setActiveGallery({ 
        main: uniqueImages[0] || '', 
        thumbs: uniqueImages.slice(1) 
      });

      trackProductView({ 
        id: data.id, 
        name: data.name, 
        price: data.price, 
        image: data.image_url, 
        slug: data.slug,
        category_id: data.category_id,
        material: data.material,
        style: data.style,
        image_alt_text: data.image_alt_text
      });
      
      if (data.category_id) {
        fetchCategoryHierarchy(data.category_id);
      }

      await Promise.all([
        fetchReviews(data.id), 
        fetchAttributes(data),
        fetchSettings()
      ]);
    } catch (error) {
      toast.error("Sản phẩm không tồn tại");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('shipping_policy_summary').single();
    if (data) setShippingPolicy(data.shipping_policy_summary);
  };

  const fetchCategoryHierarchy = async (categorySlug: string) => {
    try {
      const { data: currentCat } = await supabase.from('categories').select('id, name, slug, parent_id').eq('slug', categorySlug).single();
      if (currentCat) {
        if (currentCat.parent_id) {
          const { data: parentCat } = await supabase.from('categories').select('name, slug').eq('id', currentCat.parent_id).single();
          if (parentCat) setCategoryPath([parentCat, currentCat]);
          else setCategoryPath([currentCat]);
        } else setCategoryPath([currentCat]);
      }
    } catch (e) {}
  };

  const fetchAttributes = async (productData: any) => {
    try {
      const { data } = await supabase
        .from('product_attributes')
        .select('value, attributes(name)')
        .eq('product_id', productData.id);
      
      let dynamicAttributes: any[] = [];
      if (data) {
        dynamicAttributes = data.map(item => ({ 
          name: (item.attributes as any)?.name, 
          value: item.value 
        }));
      }
      
      setAttributes(dynamicAttributes);
    } catch (err) {
      console.error("Error fetching attributes:", err);
      setAttributes([]);
    }
  };

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleSubmitReview = async (rating: number, comment: string, name: string, imageUrl?: string, userId?: string) => {
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        rating,
        comment,
        user_name: name,
        image_url: imageUrl,
        user_id: userId
      });
      if (error) throw error;
      toast.success("Cảm ơn bạn đã gửi đánh giá thực tế!");
      fetchReviews(product.id);
    } catch (e) {
      toast.error("Không thể gửi đánh giá.");
    }
  };

  const handleVariantChange = useCallback((data: { variant: any | null, selectedValues: Record<string, string> }) => {
    const { variant, selectedValues: newSelectedValues } = data;
    
    let changedTier = null;
    for (const key in newSelectedValues) {
      if (newSelectedValues[key] !== selectedValues[key]) {
        changedTier = key;
        break;
      }
    }
    
    setSelectedValues(newSelectedValues);
    if (changedTier) setLastSelectedTier(changedTier);

    const tierConfig = product.tier_variants_config || [];

    // Hàm helper để cập nhật gallery và loại bỏ trùng lặp
    const updateGallery = (main: string, gallery: string[]) => {
      const unique = Array.from(new Set([main, ...gallery])).filter(Boolean);
      setActiveGallery({
        main: unique[0] || '',
        thumbs: unique.slice(1)
      });
    };

    // 1. Ưu tiên 1: Gallery của Biến thể đầy đủ (Tổ hợp)
    if (variant && variant.gallery_urls && variant.gallery_urls.length > 0) {
      updateGallery(variant.image_url || variant.gallery_urls[0], variant.gallery_urls);
      return;
    }

    // 2. Ưu tiên 2: Gallery của Giá trị vừa click
    const targetTier = changedTier || lastSelectedTier;
    if (targetTier) {
      const tier = tierConfig.find((t: any) => t.name === targetTier);
      const selectedVal = newSelectedValues[targetTier];
      const valueConfig = tier?.values.find((v: any) => v.label === selectedVal);
      
      // CHỈ THAY ĐỔI NẾU CÓ GALLERY ẢNH
      if (valueConfig?.gallery_urls && valueConfig.gallery_urls.length > 0) {
        updateGallery(valueConfig.image_url || valueConfig.gallery_urls[0], valueConfig.gallery_urls);
        return;
      }
    }

    // 3. Ưu tiên 3: Duyệt tất cả giá trị đang chọn xem có cái nào có gallery không
    for (const tierName in newSelectedValues) {
      const tier = tierConfig.find((t: any) => t.name === tierName);
      const val = newSelectedValues[tierName];
      const vConfig = tier?.values.find((v: any) => v.label === val);
      
      if (vConfig?.gallery_urls && vConfig.gallery_urls.length > 0) {
        updateGallery(vConfig.image_url || vConfig.gallery_urls[0], vConfig.gallery_urls);
        return;
      }
    }

    // 4. Mặc định: Nếu không có tùy chọn nào có gallery, quay về gallery gốc của sản phẩm
    const defaultImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);
    updateGallery(defaultImages[0] || '', defaultImages.slice(1));
  }, [selectedValues, lastSelectedTier, product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:type" content="product" />
        {seo.favicon && <link rel="icon" href={seo.favicon} />}
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Header />
        
        <main className="flex-1">
          <div className="bg-secondary/50 py-2.5 md:py-3 border-b border-border/40 w-full overflow-hidden">
            <div className="container-luxury flex flex-wrap items-center gap-y-1 gap-x-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <Link to="/" className="hover:text-primary transition-colors shrink-0">Trang chủ</Link>
              {categoryPath.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                  <Link to={`/${cat.slug}`} className="hover:text-primary transition-colors">{cat.name}</Link>
                </div>
              ))}
              <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
              <span className="text-foreground font-bold truncate max-w-[120px] sm:max-w-none">
                SKU: {generateSKU(product.id)}
              </span>
            </div>
          </div>

          <div className="container-luxury py-6 md:py-12">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 lg:gap-20 overflow-hidden">
              <div className="min-w-0 w-full overflow-hidden">
                <ProductGallery 
                  mainImage={activeGallery.main} 
                  galleryImages={activeGallery.thumbs} 
                  productName={product.name} 
                  product={product}
                />
                <ProductActionButtons 
                  product={product} 
                  reviews={reviews} 
                  activeGallery={activeGallery} // Truyền activeGallery vào đây
                  onQuickView={setQuickViewProduct} 
                />
              </div>
              <div className="min-w-0 w-full px-1 md:px-0 max-w-2xl">
                <ProductInfo 
                  product={product} 
                  attributes={attributes} 
                  reviewsCount={reviews.length}
                  onVariantChange={handleVariantChange}
                />
              </div>
            </div>
            
            <div className="mt-12 md:mt-24 space-y-24">
              <div id="description">
                <ProductDescription 
                  description={product.description} 
                  product={product} 
                />
              </div>
              
              <div id="reviews">
                <ProductReviews 
                  reviews={reviews} 
                  product={product} 
                  displayRating={product.fake_rating || 5} 
                  displayReviewCount={product.fake_review_count || reviews.length}
                  onSubmitReview={handleSubmitReview}
                />
              </div>

              <ProductQnA productName={product.name} onOpenChat={() => setIsAIChatOpen(true)} />

              {perfectMatch.length > 0 && (
                <div id="inspiration">
                  <ProductHorizontalScroll 
                    products={perfectMatch} 
                    title="Bộ Sưu Tập Hoàn Hảo" 
                    onQuickView={setQuickViewProduct} 
                  />
                </div>
              )}

              {boughtTogether.length > 0 && (
                <ProductHorizontalScroll products={boughtTogether} title="Gợi Ý Mua Kèm" onQuickView={setQuickViewProduct} />
              )}

              <div id="related">
                <ProductHorizontalScroll products={similarProducts} title="Sản Phẩm Tương Tự" onQuickView={setQuickViewProduct} />
              </div>

              <RecentlyViewed />

              <section id="shipping-info" className="py-12 md:py-16 border-t border-border/60">
                <div className="grid lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-charcoal">Vận Chuyển & Đổi Trả</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Thông tin hỗ trợ khách hàng</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Chính Sách Giao Hàng
                        </h3>
                        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                          <p>• <strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 5.000.000đ tại nội thành TP.HCM và Hà Nội.</p>
                          <p>• Thời gian giao hàng từ <strong>2 - 5 ngày làm việc</strong> đối với các sản phẩm có sẵn.</p>
                          <p>• Hỗ trợ lắp đặt chuyên nghiệp tại nhà bởi đội ngũ kỹ thuật của OHOUSE.</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Chính Sách Đổi Trả
                        </h3>
                        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                          <p>• Đổi trả trong vòng <strong>30 ngày</strong> nếu phát hiện lỗi từ nhà sản xuất.</p>
                          <p>• Sản phẩm đổi trả phải còn nguyên vẹn, không trầy xước và đầy đủ phụ kiện đi kèm.</p>
                          <p>• Hoàn tiền nhanh chóng qua phương thức chuyển khoản trong vòng 3-5 ngày làm việc.</p>
                        </div>
                      </div>
                    </div>
                    {shippingPolicy && (
                      <div 
                        className="mt-10 p-6 bg-secondary/30 rounded-2xl border border-border/40 vn-content-view text-muted-foreground" 
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(shippingPolicy) }} 
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-8 rounded-[32px] text-charcoal shadow-subtle border border-border/40 h-full">
                      <h3 className="font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-3 text-primary"><ShieldCheck className="w-5 h-5" /> Cam kết OHOUSE</h3>
                      <ul className="space-y-5">
                        {[
                          { icon: ShieldCheck, t: "Bảo hành 2 năm", d: "Hỗ trợ kỹ thuật trọn đời" },
                          { icon: RotateCw, t: "30 ngày đổi trả", d: "An tâm tuyệt đối khi mua sắm" },
                          { icon: CreditCard, t: "Trả góp 0%", d: "Thủ tục nhanh qua thẻ tín dụng" },
                          { icon: Truck, t: "Lắp đặt miễn phí", d: "Tận tâm trong từng chi tiết" }
                        ].map((item, i) => (
                          <li key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-border/40 shadow-sm"><item.icon className="w-5 h-5 text-primary" /></div>
                            <div><p className="text-xs font-bold uppercase tracking-wider">{item.t}</p><p className="text-[10px] text-muted-foreground mt-1">{item.d}</p></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <StickyActionToolbar product={product} />
        <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} productContext={product} />
        
        {product?.floating_video_url && (
          <FloatingVideoPlayer 
            videoUrl={product.floating_video_url} 
            onOpenFullScreen={() => setIsFullScreenVideoOpen(true)} 
          />
        )}
        
        <FullScreenVideoViewer 
          isOpen={isFullScreenVideoOpen} 
          onClose={() => setIsFullScreenVideoOpen(false)} 
          videoUrl={product?.floating_video_url || ""}
        />

        <Footer />
        <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      </div>
    </>
  );
}