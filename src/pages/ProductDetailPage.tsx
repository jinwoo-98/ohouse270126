Suggested Add-ons (Renamed) -> Similar Products.">
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, Truck, RotateCcw } from "lucide-react";
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
        // Gợi ý phối đồ (Perfect Match)
        fetchRelationProducts(data.perfect_match_ids || [], setPerfectMatch, true, data.category_id, data.id),
        // Thường mua cùng
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

            {/* 4. Bộ sưu tập phối sẵn (Sử dụng danh sách ngang - Vị trí ưu tiên 1) */}
            {perfectMatch.length > 0 && (
              <ProductHorizontalList products={perfectMatch} title="Bộ Sưu Tập Hoàn Hảo" />
            )}

            {/* 5. Gợi ý mua kèm (Setup từ admin - Vị trí ưu tiên 2) */}
            {boughtTogether.length > 0 && (
              <ProductHorizontalList products={boughtTogether} title="Gợi Ý Mua Kèm" />
            )}

            {/* 6. Sản phẩm tương tự (Fallback - Vị trí ưu tiên 3) */}
            <ProductHorizontalList products={similarProducts} title="Sản Phẩm Tương Tự" />

            <RecentlyViewed />

            {shippingPolicy && (
              <section className="py-16 border-t border-border/60">
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Truck className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-bold uppercase tracking-widest text-charcoal">Vận chuyển & Hoàn trả</h2>
                    </div>
                    <div 
                      className="rich-text-content prose prose-stone max-w-none text-muted-foreground prose-li:mb-2 prose-a:text-primary text-sm leading-relaxed text-justify"
                      dangerouslySetInnerHTML={{ __html: shippingPolicy }}
                    />
                  </div>
                  <div className="w-full md:w-1/3 bg-secondary/20 p-6 rounded-2xl h-fit">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Cam kết OHOUSE</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">✓ Đổi trả trong 30 ngày</li>
                      <li className="flex gap-2">✓ Bảo hành chính hãng 2 năm</li>
                      <li className="flex gap-2">✓ Miễn phí lắp đặt nội thành</li>
                      <li className="flex gap-2">✓ Hỗ trợ trả góp 0%</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <StickyActionToolbar product={product} />
      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} productContext={product} />
      <Footer />
    </div>
  );
}