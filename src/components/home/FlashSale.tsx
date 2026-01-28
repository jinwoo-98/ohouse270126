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
  const [products, setProducts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Config
      const { data: configData } = await supabase.from('homepage_sections').select('*').eq('section_key', 'flash_sale').single();
      if (configData) setConfig(configData);

      // 2. Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').eq('is_sale', true).order('display_order').limit(4);
      setProducts(prodData || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!config?.extra_data?.end_time) return;

    const timer = setInterval(() => {
      const end = new Date(config.extra_data.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          hours: Math.floor((distance / (1000 * 60 * 60))),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-10 md:py-24 bg-cream">
      <div className="container-luxury">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
          {config?.subtitle && (
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 block">
              {config.subtitle}
            </span>
          )}
          <h2 className="section-title mb-4" style={{ color: config?.title_color }}>
            {config?.title || "Flash Sale"}
          </h2>
          
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">Kết thúc sau</span>
            <div className="flex items-center gap-1 font-mono text-lg font-bold">
              <span className="bg-charcoal text-cream px-2 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-charcoal">:</span>
              <span className="bg-charcoal text-cream px-2 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-charcoal">:</span>
              <span className="bg-charcoal text-cream px-2 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
          </div>
          
          {config?.description && (
            <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: config.content_color }}>
              {config.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group card-luxury h-full flex flex-col">
                <div className="relative aspect-square img-zoom">
                  <Link to={`/san-pham/${product.id}`} className="block h-full">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  {product.original_price && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      className="w-full btn-hero h-10 text-[10px] py-0" 
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1 })}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 mr-2" /> Thêm Vào Giỏ
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/san-pham/${product.id}`}>
                    <h3 className="font-bold text-sm line-clamp-1 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-center gap-3">
                    <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.original_price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
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