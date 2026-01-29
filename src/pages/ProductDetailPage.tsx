import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ChevronRight, Heart, Minus, Plus, ShoppingBag, 
  Truck, RefreshCw, Shield, Star, Loader2, Send, 
  Bot, MapPin, CheckCircle2, ChevronDown, ChevronUp, Image as ImageIcon
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { cn } from "@/lib/utils";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [comboProducts, setComboProducts] = useState<any[]>([]);
  
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  
  const [isDescExpanded, setIsDescExpanded] = useState(false);
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

  // Giả lập sản phẩm mua cùng (lấy ngẫu nhiên)
  const fetchComboProducts = async (currentId: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .neq('id', currentId)
        .limit(2); // Lấy 2 sản phẩm ngẫu nhiên làm combo
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá.");
      return;
    }
    setIsReviewLoading(true);
    try {
      await supabase.from('reviews').insert({
        product_id: String(id),
        user_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment,
        user_name: user.user_metadata?.first_name || user.email?.split('@')[0]
      });
      toast.success("Cảm ơn đánh giá của bạn!");
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } finally {
      setIsReviewLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const isFavorite = isInWishlist(product.id);
  const displayRating = product.fake_rating || 5;
  const displayReviewCount = (product.fake_review_count || 0) + reviews.length;
  const displaySold = product.fake_sold || 0;

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
            {/* Left Column: Gallery */}
            <ProductGallery 
              mainImage={product.image_url} 
              galleryImages={product.gallery_urls} 
              productName={product.name} 
            />

            {/* Right Column: Info */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-primary border-primary uppercase tracking-widest text-[10px]">
                    {product.category_id}
                  </Badge>
                  {product.is_new && <Badge className="bg-blue-500 text-[10px] h-5">MỚI</Badge>}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal leading-tight">{product.name}</h1>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-4 h-4", i < Math.floor(displayRating) ? "fill-current" : "text-gray-200")} />
                    ))}
                  </div>
                  <a href="#reviews" className="text-sm text-muted-foreground border-l border-border pl-4 hover:text-primary underline">
                    Xem {displayReviewCount} đánh giá
                  </a>
                  {displaySold > 0 && (
                    <span className="text-sm text-muted-foreground border-l border-border pl-4">
                      Đã bán {displaySold}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-2xl">
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <div className="flex flex-col">
                    <span className="text-lg text-muted-foreground line-through decoration-destructive/50">{formatPrice(product.original_price)}</span>
                    <Badge variant="destructive" className="text-[10px] w-fit">
                      Tiết kiệm {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Mua Cùng (Combo) */}
              {comboProducts.length > 0 && (
                <div className="border border-border rounded-2xl p-4 bg-white shadow-sm">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">Thường được mua cùng</h4>
                  <div className="space-y-3">
                    {comboProducts.map(combo => (
                      <div key={combo.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                          <img src={combo.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/san-pham/${combo.id}`} className="text-sm font-bold hover:text-primary line-clamp-1">{combo.name}</Link>
                          <span className="text-xs text-primary font-bold">{formatPrice(combo.price)}</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" onClick={() => addToCart({...combo, quantity: 1})}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attributes.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {attributes.slice(0, 4).map((attr, i) => (
                    <div key={i} className="flex flex-col text-sm p-3 rounded-lg bg-secondary/10 border border-border/50">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold mb-1">{attr.name}</span>
                      <span className="font-medium text-charcoal">{Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center border border-border rounded-xl bg-card h-14">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full hover:bg-secondary transition-colors flex items-center justify-center rounded-l-xl"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full hover:bg-secondary transition-colors flex items-center justify-center rounded-r-xl"><Plus className="w-4 h-4" /></button>
                </div>
                <Button size="lg" className="flex-1 btn-hero h-14 text-sm font-bold shadow-gold rounded-xl" onClick={() => addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image_url,
                  quantity
                })}>
                  <ShoppingBag className="w-5 h-5 mr-2" /> THÊM VÀO GIỎ
                </Button>
                <Button size="lg" variant="outline" className={`h-14 w-14 rounded-xl border-2 ${isFavorite ? 'text-primary border-primary bg-primary/5' : 'hover:border-primary hover:text-primary'}`} onClick={() => toggleWishlist({
                   id: product.id,
                   name: product.name,
                   price: product.price,
                   image: product.image_url
                })}>
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Policy Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shipping" className="border-border">
                  <AccordionTrigger className="hover:no-underline hover:text-primary py-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-bold uppercase tracking-wider">Vận chuyển & Đổi trả</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pl-8">
                    <ul className="list-disc space-y-2 text-sm">
                      <li>Miễn phí vận chuyển cho đơn hàng trên 5.000.000đ.</li>
                      <li>Giao hàng nhanh 24h trong nội thành TP.HCM & Hà Nội.</li>
                      <li>Đổi trả miễn phí trong vòng 30 ngày nếu có lỗi sản xuất.</li>
                      <li>Kiểm tra hàng trước khi thanh toán.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="warranty" className="border-border">
                  <AccordionTrigger className="hover:no-underline hover:text-primary py-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-bold uppercase tracking-wider">Chính sách bảo hành</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pl-8">
                    <p className="text-sm">Sản phẩm được bảo hành chính hãng 2 năm về kết cấu và chất liệu. Hỗ trợ bảo trì trọn đời sản phẩm.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Description Section */}
          <section className="mb-16 scroll-mt-24" id="description">
            <h2 className="text-xl font-bold uppercase tracking-widest text-charcoal mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Chi tiết sản phẩm
            </h2>
            <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
              <div className={cn(
                "prose prose-lg prose-stone max-w-none text-muted-foreground leading-relaxed relative overflow-hidden transition-all duration-500",
                !isDescExpanded && "max-h-[300px]"
              )}>
                <div dangerouslySetInnerHTML={{ __html: product.description || "Thông tin mô tả đang được cập nhật." }} />
                
                {!isDescExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4"></div>
                )}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="rounded-full px-8 border-primary/30 text-primary hover:bg-primary/5"
                >
                  {isDescExpanded ? (
                    <>Thu gọn <ChevronUp className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>Xem tất cả <ChevronDown className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Perfect Match / Suggestions */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-center mb-10">Gợi Ý Phối Cảnh Hoàn Hảo</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center bg-charcoal text-cream rounded-3xl overflow-hidden shadow-elevated">
              <div className="aspect-video md:aspect-square relative overflow-hidden group">
                <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Inspiration" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-8 md:p-12 text-center md:text-left">
                <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Bộ Sưu Tập</span>
                <h3 className="text-2xl md:text-4xl font-bold mb-6">Không gian sống đẳng cấp</h3>
                <p className="text-taupe mb-8 leading-relaxed">
                  Sản phẩm này là mảnh ghép hoàn hảo cho phong cách nội thất hiện đại. Kết hợp cùng các món đồ decor tinh tế để tạo nên không gian sống đậm chất nghệ thuật.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {comboProducts.map(p => (
                    <Link key={p.id} to={`/san-pham/${p.id}`} className="group bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3 text-left">
                      <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-cream truncate group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-[10px] text-taupe">{formatPrice(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="mb-16 scroll-mt-24" id="reviews">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-widest text-charcoal mb-2">Đánh Giá Từ Khách Hàng</h2>
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-5 h-5", i < Math.floor(displayRating) ? "fill-current" : "text-gray-300")} />)}
                  </div>
                  <span className="font-bold text-lg">{displayRating}/5</span>
                  <span className="text-muted-foreground">({displayReviewCount} đánh giá)</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => setIsAIChatOpen(true)}>
                  <Bot className="w-4 h-4" /> Hỏi AI về sản phẩm
                </Button>
                <Button className="btn-hero h-10 px-6 text-xs">Viết đánh giá</Button>
              </div>
            </div>

            {/* Media Gallery from Reviews (Placeholder) */}
            <div className="mb-10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hình ảnh thực tế ({reviews.length > 0 ? reviews.length : 0})
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {reviews.length > 0 ? reviews.slice(0, 6).map((rev, i) => (
                  <div key={i} className="w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-border bg-gray-100 relative group cursor-pointer">
                    {/* Placeholder image logic - In real app, review table should have images */}
                    <img src={product.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">Xem ảnh</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground italic">Chưa có hình ảnh đánh giá nào.</p>
                )}
              </div>
            </div>

            {/* Review List */}
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p className="text-sm text-primary font-bold">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
                  </div>
                ) : (
                  <>
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {rev.user_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-charcoal">{rev.user_name}</p>
                              <div className="flex text-amber-400 text-[10px]">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" className="rounded-full px-8">Xem thêm đánh giá</Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick Review Form */}
              <div className="bg-secondary/20 p-6 rounded-2xl h-fit border border-border/50 sticky top-24">
                <h3 className="font-bold mb-4 text-charcoal">Gửi đánh giá của bạn</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Mức độ hài lòng</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: i })}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 ${i <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
                    rows={4} 
                    className="rounded-xl border-none shadow-sm resize-none bg-white" 
                    value={newReview.comment} 
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
                  />
                  <Button type="submit" className="w-full btn-hero h-12 shadow-gold" disabled={isReviewLoading}>
                    {isReviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
                    Gửi Đánh Giá
                  </Button>
                </form>
              </div>
            </div>
          </section>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-8">Sản phẩm tương tự</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map(p => (
                  <Link key={p.id} to={`/san-pham/${p.id}`} className="group block card-luxury">
                    <div className="aspect-square overflow-hidden bg-secondary/10 relative">
                      <img src={p.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {p.is_sale && <span className="absolute top-2 left-2 bg-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-charcoal">Sale</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-charcoal line-clamp-1 mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-primary font-bold text-sm">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <RecentlyViewed />
        </div>
      </main>
      
      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <Footer />
    </div>
  );
}