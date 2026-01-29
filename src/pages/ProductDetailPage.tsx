import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, Truck, Info, Star, MessageSquare, LayoutGrid } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [perfectMatchProducts, setPerfectMatchProducts] = useState<any[]>([]);
  const [boughtTogetherProducts, setBoughtTogetherProducts] = useState<any[]>([]);
  
  const [shippingSummary, setShippingSummary] = useState("");
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [activeSection, setActiveSection] = useState("info");

  const quickNavItems = [
    { id: "info", label: "Thông tin", icon: Info },
    { id: "description", label: "Chi tiết", icon: LayoutGrid },
    { id: "reviews", label: "Đánh giá", icon: Star },
    { id: "qna", label: "Hỏi đáp", icon: MessageSquare },
    { id: "related", label: "Gợi ý", icon: ChevronRight },
  ];

  useEffect(() => {
    if (slug) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      // Hiện Quick Nav sau khi cuộn qua phần thông tin đầu trang (~600px)
      setShowQuickNav(window.scrollY > 600);

      // Xác định section đang hiển thị
      for (const item of quickNavItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('shipping_policy_summary').single();
      if (data?.shipping_policy_summary) {
        setShippingSummary(data.shipping_policy_summary);
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
        fetchSmartList(data.perfect_match_ids, 'style', data.style, 6, data.id).then(res => setPerfectMatchProducts(res)),
        fetchSmartList(data.bought_together_ids, 'material', data.material, 6, data.id).then(res => setBoughtTogetherProducts(res))
      ]);
    } catch (error) {
      toast.error("Sản phẩm không tồn tại");
      navigate("/");
    } finally {
      setLoading(false);
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
      if (data) setAttributes(data.map(item => ({ name: (item.attributes as any)?.name, value: item.value })));
    } catch (err) {}
  };

  const fetchSimilarProducts = async (categoryId: string, currentId: string) => {
    const { data } = await supabase.from('products').select('*').eq('category_id', categoryId).neq('id', currentId).limit(6);
    setSimilarProducts(data || []);
  };

  const fetchSmartList = async (manualIds: string[] | null, filterField: string, filterValue: string, limit: number, currentId: string) => {
    try {
      if (manualIds && manualIds.length > 0) {
        const { data } = await supabase.from('products').select('*').in('id', manualIds);
        if (data && data.length > 0) return data;
      }
      if (filterValue) {
        const { data } = await supabase.from('products').select('*').eq(filterField, filterValue).neq('id', currentId).limit(limit);
        if (data && data.length > 0) return data;
      }
      const { data } = await supabase.from('products').select('*').neq('id', currentId).order('created_at', { ascending: false }).limit(limit);
      return data || [];
    } catch (e) { return []; }
  };

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleReviewSubmit = async (rating: number, comment: string, name: string) => {
    if (!product) return;
    await supabase.from('reviews').insert({ product_id: product.id, rating, comment, user_name: name });
    toast.success("Cảm ơn đánh giá của bạn!");
    fetchReviews(product.id);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 140; // Trừ đi chiều cao header + quick nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Quick Navigation Bar - Sticky on top when scrolling */}
      <AnimatePresence>
        {showQuickNav && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-md shadow-medium border-b border-border/40"
          >
            <div className="container-luxury flex items-center justify-between h-16">
              <div className="flex items-center gap-4 shrink-0 mr-8">
                <img src={product.image_url} className="w-10 h-10 rounded-lg object-cover border" alt="" />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Đang xem</p>
                  <p className="text-sm font-bold text-charcoal truncate max-w-[200px]">{product.name}</p>
                </div>
              </div>

              <nav className="flex-1 flex items-center justify-center gap-1 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth">
                {quickNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "px-3 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2",
                      activeSection === item.id 
                        ? "text-primary border-primary" 
                        : "text-muted-foreground border-transparent hover:text-charcoal"
                    )}
                  >
                    <span className="hidden sm:inline">{item.label}</span>
                    <item.icon className="w-4 h-4 sm:hidden" />
                  </button>
                ))}
              </nav>

              <div className="shrink-0 ml-4 hidden md:block">
                 <p className="text-primary font-bold">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <div className="bg-secondary/50 py-3 border-b border-border/40">
          <div className="container-luxury flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
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

        <div className="container-luxury py-8 md:py-12" id="info">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 mb-24">
            <ProductGallery mainImage={product.image_url} galleryImages={product.gallery_urls} productName={product.name} />
            <ProductInfo product={product} attributes={attributes} reviewsCount={reviews.length} />
          </div>

          <ProductDescription description={product.description} />

          <div id="reviews">
            <ProductReviews 
              reviews={reviews} 
              product={product} 
              displayRating={product.fake_rating || 5} 
              displayReviewCount={(product.fake_review_count || 0) + reviews.length} 
              onSubmitReview={handleReviewSubmit} 
            />
          </div>

          <div id="qna">
            <ProductQnA productName={product.name} onOpenChat={() => setIsAIChatOpen(true)} />
          </div>

          <div id="related" className="scroll-mt-24">
            <ProductHorizontalList products={perfectMatchProducts} title="Gợi Ý Phối Cảnh Đồng Bộ" />
            <ProductHorizontalList products={similarProducts} title="Sản phẩm tương tự" />
            <ProductHorizontalList products={boughtTogetherProducts} title="Thường được mua cùng nhau" />
          </div>

          <RecentlyViewed />

          <section className="mt-20 pt-16 border-t border-border/60">
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-border/60 shadow-sm flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
              <div className="shrink-0 flex flex-col items-center gap-4 text-primary">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center shadow-inner"><Truck className="w-10 h-10" /></div>
                <h3 className="text-xl font-bold uppercase tracking-widest leading-tight">Chính sách<br/>Vận chuyển</h3>
              </div>
              <div className="flex-1 prose prose-stone max-w-none text-muted-foreground leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: shippingSummary || "<p>OHOUSE miễn phí vận chuyển toàn quốc cho đơn hàng từ 5 triệu đồng. Thời gian giao hàng từ 3-7 ngày tùy khu vực của bạn.</p>" }} />
                <p className="mt-8 text-xs font-bold uppercase tracking-widest text-primary italic">
                  * Chi tiết tại trang <Link to="/ho-tro/van-chuyen" className="underline underline-offset-4">Chính sách vận chuyển</Link>.
                </p>
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