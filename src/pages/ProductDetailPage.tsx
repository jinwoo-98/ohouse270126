import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Truck, RefreshCw, Shield, Star, ArrowRight, Loader2, Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentlyViewed, trackProductView } from "@/components/RecentlyViewed";
import { ALL_PRODUCTS } from "@/constants/products";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const product = ALL_PRODUCTS.find(p => String(p.id) === id) || ALL_PRODUCTS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedColor(0);
    fetchReviews();
    
    trackProductView({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  }, [id, pathname, product]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', String(product.id))
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    if (!newReview.comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setIsReviewLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: String(product.id),
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment,
          user_name: user.user_metadata?.first_name || user.email?.split('@')[0]
        });

      if (error) throw error;
      toast.success("Cảm ơn bạn đã đánh giá!");
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra.");
    } finally {
      setIsReviewLoading(false);
    }
  };

  const isFavorite = isInWishlist(product.id);

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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            <div className="space-y-4">
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                ))}
              </div>
            </div>

            <div className="animate-fade-in">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.categorySlug.replace('-', ' ')}</span>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
              
              <div className="mb-6">
                <span className="font-semibold text-sm mb-3 block">Màu sắc: {product.colors[selectedColor]}</span>
                <div className="flex gap-2">
                  {product.colors.map((color, idx) => (
                    <button key={color} onClick={() => setSelectedColor(idx)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedColor === idx ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary'}`}>{color}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border rounded-lg bg-card">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-secondary transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-secondary transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <Button size="lg" className="flex-1 btn-hero" onClick={() => addToCart({...product, quantity, variant: product.colors[selectedColor]})}>
                  <ShoppingBag className="w-5 h-5 mr-2" /> Thêm Vào Giỏ
                </Button>
                <Button size="lg" variant="outline" className={`px-4 ${isFavorite ? 'text-primary border-primary bg-primary/5' : ''}`} onClick={() => toggleWishlist(product)}>
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-secondary/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-3"><Truck className="w-5 h-5 text-primary" /><div className="text-xs font-semibold">Giao hàng miễn phí</div></div>
                <div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-primary" /><div className="text-xs font-semibold">30 ngày đổi trả</div></div>
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-primary" /><div className="text-xs font-semibold">Bảo hành 2 năm</div></div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-8">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs">Mô tả</TabsTrigger>
              <TabsTrigger value="spec" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs">Thông số</TabsTrigger>
              <TabsTrigger value="review" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs">Đánh giá ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-8 animate-fade-in">
              <div className="prose prose-stone max-w-none text-muted-foreground"><p>{product.description}</p></div>
            </TabsContent>
            <TabsContent value="spec" className="py-8 animate-fade-in">
              <div className="grid gap-4 max-w-2xl">
                {product.features.map((f, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-border/50">
                    <span className="text-muted-foreground">{f.split(':')[0]}</span>
                    <span className="font-semibold">{f.split(':')[1]}</span>
                  </div>
                ))}
              </div>
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
                <div className="bg-secondary/20 p-6 rounded-lg h-fit">
                  <h3 className="font-bold mb-4">Gửi đánh giá</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex gap-2">{[1,2,3,4,5].map(i => <button key={i} type="button" onClick={() => setNewReview({...newReview, rating: i})}><Star className={`w-6 h-6 ${i <= newReview.rating ? 'fill-current text-primary' : 'text-muted-foreground'}`} /></button>)}</div>
                    <Textarea placeholder="Nội dung..." value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} />
                    <Button type="submit" className="w-full" disabled={isReviewLoading}>{isReviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Gửi</Button>
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