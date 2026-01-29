import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Truck, RefreshCw, Shield, Star, Loader2, Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ProductGallery } from "@/components/product/ProductGallery";
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
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    if (id) fetchProduct();
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
      
      await Promise.all([fetchReviews(), fetchAttributes()]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const displayRating = product.fake_rating || 5;
  const displayReviewCount = (product.fake_review_count || 0) + reviews.length;
  const displaySold = product.fake_sold || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Sản phẩm</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="container-luxury py-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Thay thế ảnh tĩnh bằng component ProductGallery mới */}
            <ProductGallery 
              mainImage={product.image_url} 
              galleryImages={product.gallery_urls} 
              productName={product.name} 
            />

            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="text-primary border-primary uppercase tracking-widest text-[10px]">
                  {product.category_id}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mt-3 text-charcoal">{product.name}</h1>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-4 h-4", i < Math.floor(displayRating) ? "fill-current" : "text-gray-300")} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground border-l border-border pl-4">
                    {displayReviewCount} Đánh giá
                  </span>
                  {displaySold > 0 && (
                    <span className="text-sm text-muted-foreground border-l border-border pl-4">
                      Đã bán {displaySold}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                )}
                {product.original_price && (
                  <Badge className="bg-destructive hover:bg-destructive text-[10px]">
                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </Badge>
                )}
              </div>

              {attributes.length > 0 && (
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-border/50">
                  {attributes.slice(0, 4).map((attr, i) => (
                    <div key={i} className="flex flex-col text-sm">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">{attr.name}</span>
                      <span className="font-medium text-charcoal">{Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed line-clamp-3">{product.description?.replace(/<[^>]+>/g, '')}</p>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center border border-border rounded-xl bg-card">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-secondary transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-4 hover:bg-secondary transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <Button size="lg" className="flex-1 btn-hero h-14 shadow-gold" onClick={() => addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image_url,
                  quantity
                })}>
                  <ShoppingBag className="w-5 h-5 mr-2" /> Thêm Vào Giỏ
                </Button>
                <Button size="lg" variant="outline" className={`px-4 h-14 ${isFavorite ? 'text-primary border-primary bg-primary/5' : ''}`} onClick={() => toggleWishlist({
                   id: product.id,
                   name: product.name,
                   price: product.price,
                   image: product.image_url
                })}>
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center space-y-1">
                  <Truck className="w-5 h-5 mx-auto text-primary" />
                  <p className="text-[10px] font-bold uppercase">Giao hàng 24h</p>
                </div>
                <div className="text-center space-y-1">
                  <RefreshCw className="w-5 h-5 mx-auto text-primary" />
                  <p className="text-[10px] font-bold uppercase">30 ngày đổi trả</p>
                </div>
                <div className="text-center space-y-1">
                  <Shield className="w-5 h-5 mx-auto text-primary" />
                  <p className="text-[10px] font-bold uppercase">Bảo hành 2 năm</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-8 overflow-x-auto no-scrollbar">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs whitespace-nowrap">Mô tả sản phẩm</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs whitespace-nowrap">Thông số kỹ thuật</TabsTrigger>
              <TabsTrigger value="review" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs whitespace-nowrap">Đánh giá ({displayReviewCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="py-8 animate-fade-in">
              <div 
                className="prose prose-lg prose-stone max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || "Thông tin mô tả đang được cập nhật." }}
              />
            </TabsContent>

            <TabsContent value="specs" className="py-8 animate-fade-in">
              {attributes.length > 0 ? (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden max-w-2xl">
                  <table className="w-full text-sm text-left">
                    <tbody className="divide-y">
                      {attributes.map((attr, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-bold text-muted-foreground bg-gray-50/30 w-1/3 uppercase text-xs tracking-wider">{attr.name}</td>
                          <td className="px-6 py-4 text-charcoal font-medium">
                            {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground italic">Chưa có thông số kỹ thuật chi tiết.</p>
              )}
            </TabsContent>

            <TabsContent value="review" className="py-8 animate-fade-in">
               <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {reviews.length === 0 ? <p className="text-muted-foreground italic">Chưa có đánh giá nào.</p> : reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-border pb-6">
                      <div className="flex justify-between mb-2"><span className="font-bold">{rev.user_name}</span><span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span></div>
                      <div className="flex text-primary mb-3">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= rev.rating ? 'fill-current' : ''}`} />)}</div>
                      <p className="text-sm text-muted-foreground">{rev.comment}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-secondary/20 p-6 rounded-2xl h-fit border border-border/50">
                  <h3 className="font-bold mb-4">Gửi đánh giá của bạn</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex gap-2">{[1,2,3,4,5].map(i => <button key={i} type="button" onClick={() => setNewReview({...newReview, rating: i})}><Star className={`w-6 h-6 ${i <= newReview.rating ? 'fill-current text-primary' : 'text-muted-foreground'}`} /></button>)}</div>
                    <Textarea placeholder="Bạn thấy sản phẩm này thế nào?" rows={4} className="rounded-xl border-none shadow-sm" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} />
                    <Button type="submit" className="w-full btn-hero" disabled={isReviewLoading}>{isReviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Gửi đánh giá</Button>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <RecentlyViewed />
        </div>
      </main>
      <Footer />
    </div>
  );
}