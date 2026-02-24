import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: configData } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'featured')
        .single();
      if (configData) setConfig(configData);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(12);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-10 md:py-24 bg-background">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          {config?.subtitle && (
            <span className="font-bold uppercase tracking-[0.3em] text-[10px] mb-3 block" style={{ color: config.subtitle_color }}>
              {config.subtitle}
            </span>
          )}
          <h2 className="section-title mb-2" style={{ color: config?.title_color }}>
            {config?.title || "Sản Phẩm Nổi Bật"}
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base mb-6" style={{ color: config?.content_color }}>
            {config?.description || "Những thiết kế được yêu thích nhất"}
          </p>
          <Button variant="outline" asChild className="mb-8">
            <Link to="/noi-that" className="group">
              Xem Tất Cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <CarouselItem key={i} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCardSkeleton />
                </CarouselItem>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">Chưa có sản phẩm nổi bật nào.</div>
            ) : (
              products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}