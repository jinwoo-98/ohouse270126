import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function FlashSale() {
  const [products, setProducts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: configData } = await supabase.from('homepage_sections').select('*').eq('section_key', 'flash_sale').single();
      if (configData) setConfig(configData);

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
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block" style={{ color: config.subtitle_color }}>
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
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }} 
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}