import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function FlashSale() {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 29, seconds: 53 });
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);

    fetchSaleProducts();

    return () => clearInterval(timer);
  }, []);

  const fetchSaleProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_sale', true)
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading sale products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-10 md:py-24 bg-cream">
      <div className="container-luxury">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
          <h2 className="section-title mb-2 md:mb-4">Flash Sale</h2>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
            <span className="text-sm md:text-base text-muted-foreground mr-1 md:mr-2">Kết thúc sau</span>
            <div className="flex items-center gap-1 font-mono text-base md:text-lg font-bold">
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}</span>:
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}</span>:
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group card-luxury h-full flex flex-col">
                <div className="relative aspect-square img-zoom">
                  <Link to={`/san-pham/${product.id}`} className="block h-full">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="absolute inset-0 bg-charcoal/0 lg:group-hover:bg-charcoal/20 transition-all flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100">
                    <Button 
                      size="sm" 
                      className="shadow-lg opacity-100 lg:opacity-100" 
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1 })}
                    >
                      <ShoppingBag className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Thêm nhanh</span>
                    </Button>
                  </div>
                  {product.original_price && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <Link to={`/san-pham/${product.id}`}>
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 mb-2 md:mb-3 group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex flex-col">
                    <span className="text-base md:text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.original_price && (
                      <span className="text-xs md:text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}