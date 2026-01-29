import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { ProductInfo } from "@/components/product/detail/ProductInfo";
import { ProductHorizontalList } from "@/components/product/detail/ProductHorizontalList";
import { ProductQnA } from "@/components/product/detail/ProductQnA";
import { ProductDescription } from "@/components/product/detail/ProductDescription";
import { ProductReviews } from "@/components/product/detail/ProductReviews";
import { StickyActionToolbar } from "@/components/product/detail/StickyActionToolbar";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data Sections
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [perfectMatch, setPerfectMatch] = useState<any[]>([]);
  const [boughtTogether, setBoughtTogether] = useState<any[]>([]);
  const [shippingPolicy, setShippingPolicy] = useState("");
  
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

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
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      setProduct(data);
      
      trackProductView({ id: data.id, name: data.name, price: data.price, image: data.image_url, slug: data.slug });
      
      if (data.category_id) {
        fetchCategoryHierarchy(data.category_id);
      }

      await Promise.all([
        fetchReviews(data.id), 
        fetchAttributes(data.id),
        fetchSimilarProducts(data.category_id, data.id),
        fetchRelationProducts(data.perfect_match_ids || [], setPerfectMatch, true, data.category_id, data.id),
        fetchRelationProducts(data.bought_together_ids || [], setBoughtTogether, true, 'all', data.id),
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

  const fetchRelationProducts = async (ids: string[], setter: (val: any[]) => void, useFallback = false, catId = "", currentId = "") => {
    if (ids && ids.length > 0) {
      const { data } = await supabase.from('products').select('*').in('id', ids);
      if (data && data.length > 0) {
        setter(data);
        return;
      }
    }
    
    if (useFallback) {
      let query = supabase.from('products').select('*').neq('id', currentId).limit(8);
      if (catId !== 'all') {
        query = query.eq('category_id', catId);
      } else {
        query = query.eq('is_featured', true);
      }
      const { data } = await query;
      setter(data || []);
    }
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

  const fetchAttributes = async (productId: string) => {
    try {
      const { data } = await supabase.from('product_attributes').select('value, attributes(name)').eq('product_id', productId);
      if (data) {
        setAttributes(data.map(item => ({ 
          name: (item.attributes as any)?.name, 
          value: item.value 
        })));
      }
    } catch (err) {}
  };

  const fetchSimilarProducts = async (categoryId: string, currentId: string) => {
    const { data } = await supabase.from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', currentId)
      .limit(8);
    setSimilarProducts(data || []);
  };

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleSubmitReview = async (rating: number, comment: string, name: string) => {
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        rating,
        comment,
        user_name: name
      });
      if (error) throw error;
      toast.success("Cảm ơn bạn đã đánh giá!");
      fetchReviews(product.id);
    } catch (e) {
      toast.error("Không thể gửi đánh giá.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-secondary/50 py-3 border-b border-border/40">
          <div className="container-luxury flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            {categoryPath.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <Link to={`/${cat.slug}`} className="hover:text-primary transition-colors">{cat.name}</Link>
              </div>
            ))}
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-bold line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="container-luxury py-12">
          {/* Top Section: Gallery & Summary Info */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            <ProductGallery mainImage={product.image_url} galleryImages={product.gallery_urls} productName={product.name} />
            <ProductInfo product={product} attributes={attributes} reviewsCount={reviews.length} />
          </div>

          {/* Main Content Area */}
          <div className="max-w-6xl mx-auto space-y-24">
            
            <ProductDescription description={product.description} />
            
            <ProductReviews 
              reviews={reviews} 
              product={product} 
              displayRating={product.fake_rating || 5} 
              displayReviewCount={product.fake_review_count || reviews.length}
              onSubmitReview={handleSubmitReview}
            />

            <ProductQnA productName={product.name} onOpenChat={() => setIsAIChatOpen(true)} />

            {/* 4. Bộ sưu tập phối sẵn */}
            {perfectMatch.length > 0 && (
              <ProductHorizontalList products={perfectMatch} title="Bộ Sưu Tập Hoàn Hảo" />
            )}

            {/* 5. Gợi ý mua kèm */}
            {boughtTogether.length > 0 && (
              <ProductHorizontalList products={boughtTogether} title="Gợi Ý Mua Kèm" />
            )}

            {/* 6. Sản phẩm tương tự */}
            <ProductHorizontalList products={similarProducts} title="Sản Phẩm Tương Tự" />

            {/* 7. Lịch sử xem */}
            <RecentlyViewed />

            {/* 8. Chính sách Vận chuyển & Đổi trả (Tóm tắt từ 2 trang) */}
            <section className="py-16 border-t border-border/60">
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
                    {/* Vận chuyển */}
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

                    {/* Đổi trả */}
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

                  {/* Dynamic summary from settings if exists */}
                  {shippingPolicy && (
                    <div 
                      className="mt-10 p-6 bg-secondary/30 rounded-2xl border border-border/40 prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: shippingPolicy }}
                    />
                  )}
                  
                  <div className="mt-8 flex gap-4">
                    <Button variant="link" className="p-0 h-auto text-primary font-bold text-[10px] uppercase tracking-widest" asChild>
                      <Link to="/ho-tro/van-chuyen">Chi tiết vận chuyển +</Link>
                    </Button>
                    <Button variant="link" className="p-0 h-auto text-primary font-bold text-[10px] uppercase tracking-widest" asChild>
                      <Link to="/ho-tro/doi-tra">Chi tiết đổi trả +</Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-charcoal p-8 rounded-[32px] text-cream shadow-elevated border border-white/5 h-full">
                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary" /> Cam kết OHOUSE
                    </h3>
                    <ul className="space-y-5">
                      {[
                        { icon: ShieldCheck, t: "Bảo hành 2 năm", d: "Hỗ trợ kỹ thuật trọn đời" },
                        { icon: RotateCcw, t: "30 ngày đổi trả", d: "An tâm tuyệt đối khi mua sắm" },
                        { icon: CreditCard, t: "Trả góp 0%", d: "Thủ tục nhanh qua thẻ tín dụng" },
                        { icon: Truck, t: "Lắp đặt miễn phí", d: "Tận tâm trong từng chi tiết" }
                      ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                            <item.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider">{item.t}</p>
                            <p className="text-[10px] text-taupe mt-1">{item.d}</p>
                          </div>
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
      <Footer />
    </div>
  );
}