import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, ChevronRight, Plus, ShoppingBag, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function LookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [look, setLook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchLook();
    }
  }, [id]);

  const fetchLook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_looks')
        .select('*, shop_look_items(*, products(*))')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error("Không tìm thấy không gian thiết kế này.");
        navigate("/cam-hung");
        return;
      }
      setLook(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!look) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary/50 py-3 border-b border-border/40">
          <div className="container-luxury flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/cam-hung" className="hover:text-primary transition-colors">Cảm hứng</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{look.title}</span>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image with Hotspots */}
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-subtle border border-border/40">
              <img src={look.image_url} alt={look.title} className="w-full h-full object-cover" />
              {look.shop_look_items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setQuickViewProduct(item.products)}
                  className="absolute w-8 h-8 -ml-4 -mt-4 bg-white/90 backdrop-blur-sm border-2 border-primary rounded-full shadow-gold flex items-center justify-center text-primary hover:scale-125 transition-all animate-fade-in z-10 group"
                  style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-75 group-hover:hidden" />
                </button>
              ))}
            </div>

            {/* Right: Product List */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{look.title}</h1>
              <p className="text-muted-foreground mb-8">Khám phá các sản phẩm được sử dụng trong không gian này và thêm vào giỏ hàng của bạn.</p>
              
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {look.shop_look_items.map((item: any) => {
                  const product = item.products;
                  if (!product) return null;
                  const isFavorite = isInWishlist(product.id);
                  
                  return (
                    <div key={item.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all shadow-subtle">
                      <Link to={`/san-pham/${product.slug}`} className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary/20">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/san-pham/${product.slug}`}><h3 className="text-sm font-bold truncate group-hover:text-primary">{product.name}</h3></Link>
                        <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" className="h-8 text-[10px] font-bold" onClick={() => setQuickViewProduct(product)}>
                            <Eye className="w-3 h-3 mr-1.5" /> Xem nhanh
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" onClick={() => addToCart({ ...product, quantity: 1, image: product.image_url })}>
                            <ShoppingBag className="w-3 h-3 mr-1.5" /> Thêm vào giỏ
                          </Button>
                          <Button size="icon" variant="ghost" className={`h-8 w-8 ${isFavorite ? 'text-primary' : ''}`} onClick={() => toggleWishlist(product)}>
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}