import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { ProductInfo } from "@/components/product/detail/ProductInfo";
import { ProductDescription } from "@/components/product/detail/ProductDescription";
import { ProductInspiration } from "@/components/product/detail/ProductInspiration";
import { ProductReviews } from "@/components/product/detail/ProductReviews";
import { RelatedProducts } from "@/components/product/detail/RelatedProducts";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [comboProducts, setComboProducts] = useState<any[]>([]);
  
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

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
        fetchComboProducts(data.id)
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
        .limit(4);
      setSimilarProducts(data || []);
    } catch (err) {}
  };

  const fetchComboProducts = async (currentId: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .neq('id', currentId)
        .limit(2);
      setComboProducts(data || []);
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

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá.");
      return;
    }
    try {
      await supabase.from('reviews').insert({
        product_id: String(id),
        user_id: user.id,
        rating: rating,
        comment: comment,
        user_name: user.user_metadata?.first_name || user.email?.split('@')[0]
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
            <ProductGallery 
              mainImage={product.image_url} 
              galleryImages={product.gallery_urls} 
              productName={product.name} 
            />

            <ProductInfo 
              product={product} 
              attributes={attributes} 
              comboProducts={comboProducts} 
              reviewsCount={reviews.length} 
            />
          </div>

          <ProductDescription description={product.description} />

          <ProductInspiration product={product} comboProducts={comboProducts} />

          <ProductReviews 
            reviews={reviews}
            product={product}
            user={user}
            displayRating={product.fake_rating || 5}
            displayReviewCount={(product.fake_review_count || 0) + reviews.length}
            onSubmitReview={handleReviewSubmit}
            onOpenAIChat={() => setIsAIChatOpen(true)}
          />

          <RelatedProducts products={similarProducts} />

          <RecentlyViewed />
        </div>
      </main>
      
      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <Footer />
    </div>
  );
}