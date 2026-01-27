import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Truck, RefreshCw, Shield, Check, Star, ArrowRight, Loader2, Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryDesk from "@/assets/category-desk.jpg";

const MOCK_PRODUCTS: Record<string, any> = {
  "1": { id: "1", name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá Sintered Stone", price: 25990000, originalPrice: 32990000, category: "Kệ Tivi", image: categoryTvStand, images: [categoryTvStand, categorySofa, categoryDiningTable, categoryCoffeeTable], description: "Kệ tivi cao cấp kết hợp hoàn hảo giữa gỗ óc chó tự nhiên và mặt đá sintered stone.", features: ["Chất liệu: Gỗ óc chó + Đá Sintered", "Kích thước: 180cm", "Bảo hành: 2 năm"], colors: ["Nâu Óc Chó", "Tự Nhiên"] },
  "2": { id: "2", name: "Sofa Góc Chữ L Vải Nhung Ý Cao Cấp", price: 45990000, originalPrice: 52000000, category: "Sofa", image: categorySofa, images: [categorySofa, categoryCoffeeTable, categoryDiningTable], description: "Sofa cao cấp với chất liệu vải nhung nhập khẩu, khung gỗ sồi tự nhiên.", features: ["Khung gỗ sồi", "Vải nhung kháng khuẩn", "Đệm mút 4 lớp"], colors: ["Xám Chuột", "Xanh Navy", "Be"] },
  "3": { id: "3", name: "Bàn Ăn Mặt Đá Marble Chân Gỗ Óc Chó", price: 32990000, originalPrice: 38990000, category: "Bàn Ăn", image: categoryDiningTable, images: [categoryDiningTable, categoryCoffeeTable, categorySofa, categoryTvStand], description: "Mặt đá Marble tự nhiên vân mây kết hợp chân gỗ óc chó cao cấp.", features: ["Đá Marble tự nhiên", "Chân gỗ óc chó", "Kèm 6 ghế bọc da"], colors: ["Trắng Vân Mây", "Đen Tia Chớp"] },
  "4": { id: "4", name: "Bàn Trà Tròn Mặt Kính Cường Lực", price: 12990000, category: "Bàn Trà", image: categoryCoffeeTable, images: [categoryCoffeeTable, categorySofa, categoryTvStand], description: "Thiết kế tối giản với mặt kính cường lực và chân inox mạ titan.", features: ["Kính cường lực 12mm", "Chân inox 304", "Chống trầy xước"], colors: ["Vàng Gương", "Bạc Chrome"] },
  "6": { id: "6", name: "Giường Ngủ Bọc Da Ý Khung Inox", price: 38990000, category: "Giường", image: categoryBed, images: [categoryBed, categorySofa, categoryDiningTable], description: "Giường ngủ bọc da bò thật nhập khẩu từ Ý, thiết kế chuẩn ergonomic.", features: ["Da bò thật 100%", "Khung thép chịu lực", "Bảo hành 5 năm"], colors: ["Nâu Bò", "Kem", "Đen"] },
  "14": { id: "14", name: "Tủ Quần Áo Gỗ Sồi 4 Cánh Hiện Đại", price: 22000000, category: "Tủ Quần Áo", image: categorySofa, images: [categorySofa, categoryBed, categoryDesk], description: "Tủ quần áo gỗ sồi tự nhiên với không gian lưu trữ rộng rãi.", features: ["Gỗ Sồi tự nhiên", "Chống mối mọt", "Ray trượt giảm chấn"], colors: ["Sồi Tự Nhiên", "Sồi Trắng"] }
};

const RELATED_PRODUCTS = [
  { id: "1", name: "Kệ Tivi Gỗ Óc Chó", price: 25990000, image: categoryTvStand },
  { id: "2", name: "Sofa Vải Nhung", price: 45990000, image: categorySofa },
  { id: "3", name: "Bàn Ăn Mặt Đá", price: 32990000, image: categoryDiningTable },
  { id: "4", name: "Bàn Trà Kính", price: 12990000, image: categoryCoffeeTable },
];

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

  const product = MOCK_PRODUCTS[id || "1"] || MOCK_PRODUCTS["1"];

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedColor(0);
    fetchReviews();
  }, [id, pathname]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id || "1")
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
          product_id: id || "1",
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment,
          user_name: user.user_metadata?.first_name || user.email?.split('@')[0]
        });

      if (error) throw error;

      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setIsReviewLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      variant: product.colors[selectedColor]
    });
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
                {product.images.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                ))}
              </div>
            </div>

            <div className="animate-fade-in">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-primary">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : ''}`} />)}
                </div>
                <span className="text-sm text-muted-foreground">({reviews.length} đánh giá)</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
              
              <div className="mb-6">
                <span className="font-semibold text-sm mb-3 block">Màu sắc: {product.colors[selectedColor]}</span>
                <div className="flex gap-2">
                  {product.colors.map((color: string, idx: number) => (
                    <button key={color} onClick={() => setSelectedColor(idx)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedColor === idx ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary'}`}>{color}</button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <span className="font-semibold text-sm mb-3 block">Số lượng</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg bg-card">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-secondary transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-secondary transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button size="lg" className="flex-1 btn-hero" onClick={handleAddToCart}>
                  <ShoppingBag className="w-5 h-5 mr-2" /> 
                  Thêm Vào Giỏ
                </Button>
                <Button size="lg" variant="outline" className={`px-4 transition-all ${isFavorite ? 'text-primary border-primary bg-primary/5' : ''}`} onClick={() => toggleWishlist(product)}>
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? "Đã yêu thích" : "Yêu thích"}
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
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs">Mô tả sản phẩm</TabsTrigger>
              <TabsTrigger value="spec" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs">Thông số kỹ thuật</TabsTrigger>
              <TabsTrigger value="review" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-0 font-bold uppercase tracking-widest text-xs">Đánh giá ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-8 animate-fade-in">
              <div className="prose prose-stone max-w-none">
                <p>{product.description}</p>
                <p>Mỗi chi tiết trong sản phẩm của OHOUSE đều được chế tác tỉ mỉ bởi các nghệ nhân lành nghề, kết hợp cùng công nghệ sản xuất hiện đại để mang đến vẻ đẹp tinh tế và độ bền vượt trội.</p>
              </div>
            </TabsContent>
            <TabsContent value="spec" className="py-8 animate-fade-in">
              <div className="grid gap-4 max-w-2xl">
                {product.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50">
                    <span className="text-muted-foreground">{f.split(':')[0]}</span>
                    <span className="font-semibold">{f.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="review" className="py-8 animate-fade-in">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground italic">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-border pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">{rev.user_name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex text-primary mb-3">
                          {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= rev.rating ? 'fill-current' : ''}`} />)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="bg-secondary/20 p-6 rounded-lg h-fit">
                  <h3 className="font-bold mb-4">Gửi đánh giá của bạn</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} type="button" onClick={() => setNewReview({...newReview, rating: i})} className="transition-transform hover:scale-110">
                          <Star className={`w-6 h-6 ${i <= newReview.rating ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea 
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." 
                      className="bg-card"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    />
                    <Button type="submit" className="w-full" disabled={isReviewLoading}>
                      {isReviewLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Gửi đánh giá
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Sản Phẩm Liên Quan</h2>
              <Button variant="ghost" asChild className="group">
                <Link to="/noi-that">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {RELATED_PRODUCTS.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group">
                  <Link to={`/san-pham/${item.id}`} className="block card-luxury overflow-hidden">
                    <div className="aspect-square img-zoom">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="font-bold text-primary">{formatPrice(item.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}