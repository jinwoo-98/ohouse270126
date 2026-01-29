import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, Truck } from "lucide-react";
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
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('shipping_policy_summary').single();
      if (data?.shipping_policy_summary) {
        setShippingSummary(data.shipping_policy_summary);
      } else {
        setShippingSummary(`
          <p><strong>Miễn phí vận chuyển:</strong> Áp dụng cho đơn hàng từ 5.000.000đ trở lên.</p>
          <p><strong>Thời gian giao hàng:</strong> Từ 2 - 5 ngày làm việc trên toàn quốc.</p>
          <p><strong>Chính sách đổi trả:</strong> Hỗ trợ đổi trả trong vòng 30 ngày nếu có lỗi từ nhà sản xuất.</p>
        `);
      }
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
      
      trackProductView({ id: data.id, name: data.name, price: data.price, image: data.image_url });
      
      // Fetch data lists parallel
      await Promise.all([
        fetchReviews(), 
        fetchAttributes(),
        fetchSimilarProducts(data.category_id, data.id),
        // Combo Perfect Match: Lấy theo ID setup hoặc tìm sản phẩm cùng Phong cách (Style)
        fetchSmartList(data.perfect_match_ids, 'style', data.style, 6).then(res => setPerfectMatchProducts(res)),
        // Bought Together: Lấy theo ID setup hoặc tìm sản phẩm cùng Chất liệu (Material)
        fetchSmartList(data.bought_together_ids, 'material', data.material, 6).then(res => setBoughtTogetherProducts(res))
      ]);
    } catch (error) {
      toast.error("Sản phẩm không tồn tại");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      const { data } = await supabase.from('product_attributes').select('value, attributes(name)').eq('product_id', id);
      if (data) setAttributes(data.map(item => ({ name: item.attributes?.name, value: item.value })));
    } catch (err) {}
  };

  const fetchSimilarProducts = async (categoryId: string, currentId: string) => {
    const { data } = await supabase.from('products').select('*').eq('category_id', categoryId).neq('id', currentId).limit(6);
    if (data && data.length > 0) setSimilarProducts(data);
    else {
      const { data: fallback } = await supabase.from('products').select('*').neq('id', currentId).limit(6);
      setSimilarProducts(fallback || []);
    }
  };

  // Logic lấy danh sách thông minh: Theo ID setup -> hoặc theo Filter (Style/Material) -> hoặc ngẫu nhiên
  const fetchSmartList = async (manualIds: string[] | null, filterField: string, filterValue: string, limit: number) => {
    try {
      // 1. Nếu có setup tay, ưu tiên lấy theo ID
      if (manualIds && manualIds.length > 0) {
        const { data } = await supabase.from('products').select('*').in('id', manualIds);
        if (data && data.length > 0) return data;
      }

      // 2. Nếu không có setup tay, tìm sản phẩm có cùng phong cách/chất liệu
      if (filterValue) {
        const { data } = await supabase.from('products').select('*').eq(filterField, filterValue).neq('id', id).limit(limit);
        if (data && data.length > 0) return data;
      }

      // 3. Fallback cuối cùng: Lấy hàng mới/nổi bật
      const { data } = await supabase.from('products').select('*').neq('id', id).order('created_at', { ascending: false }).limit(limit);
      return data || [];
    } catch (e) { return []; }
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', String(id)).order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleReviewSubmit = async (rating: number, comment: string, name: string) => {
    await supabase.from('reviews').insert({ product_id: String(id), rating, comment, user_name: name });
    toast.success("Cảm ơn đánh giá của bạn!");
    fetchReviews();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
            <ProductGallery mainImage={product.image_url} galleryImages={product.gallery_urls} productName={product.name} />
            <ProductInfo product={product} attributes={attributes} reviewsCount={reviews.length} />
          </div>

          <ProductDescription description={product.description} />

          <ProductReviews reviews={reviews} product={product} displayRating={product.fake_rating || 5} displayReviewCount={(product.fake_review_count || 0) + reviews.length} onSubmitReview={handleReviewSubmit} />

          <ProductQnA productName={product.name} onOpenChat={() => setIsAIChatOpen(true)} />

          <ProductHorizontalList products={perfectMatchProducts} title="Gợi Ý Phối Cảnh Đồng Bộ" />

          <ProductHorizontalList products={similarProducts} title="Sản phẩm tương tự" />

          <ProductHorizontalList products={boughtTogetherProducts} title="Thường được mua cùng nhau" />

          <RecentlyViewed />

          <section className="mt-16 pt-12 border-t border-border">
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-border/60 shadow-sm flex flex-col md:flex-row gap-10 items-start">
              <div className="shrink-0 flex items-center gap-3 text-primary">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Truck className="w-7 h-7" /></div>
                <h3 className="text-xl font-bold uppercase tracking-widest leading-tight">Chính sách<br/>Vận chuyển & Đổi trả</h3>
              </div>
              <div className="flex-1 prose prose-stone max-w-none text-muted-foreground leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: shippingSummary }} />
                <p className="mt-6 text-xs italic">* Chi tiết vui lòng xem tại trang <Link to="/ho-tro/van-chuyen" className="text-primary font-bold underline">Chính sách vận chuyển</Link>.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} productContext={product} />
      <Footer />
    </div>
  );
}