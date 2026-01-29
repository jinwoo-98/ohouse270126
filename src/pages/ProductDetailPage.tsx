import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, MapPin, Truck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { ProductInfo } from "@/components/product/detail/ProductInfo";
import { ProductDescription } from "@/components/product/detail/ProductDescription";
import { ProductReviews } from "@/components/product/detail/ProductReviews";
import { ProductHorizontalList } from "@/components/product/detail/ProductHorizontalList";
import { ProductQnA } from "@/components/product/detail/ProductQnA";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  
  // Lists
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [perfectMatchProducts, setPerfectMatchProducts] = useState<any[]>([]);
  const [boughtTogetherProducts, setBoughtTogetherProducts] = useState<any[]>([]);
  
  const [shippingSummary, setShippingSummary] = useState("");
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    // Fetch Shipping Summary
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('shipping_policy_summary').single();
      if (data?.shipping_policy_summary) setShippingSummary(data.shipping_policy_summary);
    };
    fetchSettings();
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProduct(data);
      
      trackProductView({
        id: data.id,
        name: data.name,
        price: data.price,
        image: data.image_url
      });
      
      await Promise.all([
        fetchReviews(), 
        fetchAttributes(),
        fetchSimilarProducts(data.category_id, data.id),
        fetchProductList(data.perfect_match_ids, setPerfectMatchProducts, 4, 'random'),
        fetchProductList(data.bought_together_ids, setBoughtTogetherProducts, 4, 'random')
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Sản phẩm không tồn tại");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      const { data } = await supabase
        .from('product_attributes')
        .select('value, attributes(name)')
        .eq('product_id', id);
      
      if (data) {
        setAttributes(data.map(item => ({
          name: item.attributes?.name,
          value: item.value
        })));
      }
    } catch (err) {}
  };

  const fetchSimilarProducts = async (categoryId: string, currentId: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', currentId)
        .limit(6);
      setSimilarProducts(data || []);
    } catch (err) {}
  };

  // Helper fetch list by IDs OR random fallback
  const fetchProductList = async (ids: string[] | null, setter: (val: any[]) => void, limit: number, fallback: 'random' | 'none') => {
    try {
      if (ids && ids.length > 0) {
        const { data } = await supabase.from('products').select('*').in('id', ids);
        setter(data || []);
      } else if (fallback === 'random') {
        // Random fallback logic
        const { data } = await supabase.from('products').select('*').limit(limit).neq('id', id); // Simplified random
        setter(data || []);
      }
    } catch (err) {}
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', String(id))
        .order('created_at', { ascending: false });
      setReviews(data || []);
    } catch (err) {}
  };

  const handleReviewSubmit = async (rating: number, comment: string, name: string) => {
    try {
      // In real app, user_id is optional for guest orders or we link via email
      // Here we assume basic review structure
      await supabase.from('reviews').insert({
        product_id: String(id),
        rating: rating,
        comment: comment,
        user_name: name
      });
      toast.success("Cảm ơn đánh giá của bạn!");
      fetchReviews();
    } catch (error) {
      toast.error("Không thể gửi đánh giá");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/noi-that" className="hover:text-primary">Sản phẩm</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="container-luxury py-8">
          {/* 1. Main Info Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
            <ProductGallery 
              mainImage={product.image_url} 
              galleryImages={product.gallery_urls} 
              productName={product.name} 
            />
            <ProductInfo 
              product={product} 
              attributes={attributes} 
              reviewsCount={reviews.length} 
            />
          </div>

          {/* 2. Product Description */}
          <ProductDescription description={product.description} />

          {/* 3. Reviews */}
          <ProductReviews 
            reviews={reviews}
            product={product}
            displayRating={product.fake_rating || 5}
            displayReviewCount={(product.fake_review_count || 0) + reviews.length}
            onSubmitReview={handleReviewSubmit}
          />

          {/* 4. AI Q&A Section (Separate Row) */}
          <ProductQnA productName={product.name} onOpenChat={() => setIsAIChatOpen(true)} />

          {/* 5. Perfect Match (Horizontal) */}
          <ProductHorizontalList products={perfectMatchProducts} title="Gợi Ý Phối Cảnh Hoàn Hảo (Perfect Match)" />

          {/* 6. Similar Products (Horizontal) */}
          <ProductHorizontalList products={similarProducts} title="Sản phẩm tương tự" />

          {/* 7. Bought Together (Horizontal) */}
          <ProductHorizontalList products={boughtTogetherProducts} title="Thường được mua cùng" />

          {/* 8. Recently Viewed */}
          <RecentlyViewed />

          {/* 9. Shipping Policy Summary */}
          {shippingSummary && (
            <section className="mt-16 pt-10 border-t border-border">
              <div className="bg-white p-8 rounded-3xl border border-border/60 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0 flex items-center gap-3 text-primary">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-widest hidden md:block">Chính sách<br/>Vận chuyển & Đổi trả</h3>
                </div>
                <div className="flex-1 prose prose-sm max-w-none text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: shippingSummary }} />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      
      {/* Pass Product context to AI if possible, simple implementation for now */}
      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <Footer />
    </div>
  );
}