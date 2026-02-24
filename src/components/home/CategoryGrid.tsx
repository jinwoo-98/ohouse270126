import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getOptimizedImageUrl } from "@/lib/utils";

export function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: configData } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'categories')
        .single();
      if (configData) setConfig(configData);

      const { data: catData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('show_on_home', true)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(catData || []);
    } catch (error) {
      console.error("Error loading home categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) return null;

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
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block" style={{ color: config.subtitle_color }}>
              {config.subtitle}
            </span>
          )}
          <h2 className="section-title mb-2 md:mb-4" style={{ color: config?.title_color }}>
            {config?.title || "Danh Mục Sản Phẩm"}
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base" style={{ color: config?.content_color }}>
            {config?.description || "Khám phá bộ sưu tập nội thất cao cấp với hàng nghìn sản phẩm đa dạng"}
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            dragFree: false,
            skipSnaps: false
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 touch-pan-y">
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                <Link
                  to={`/${category.slug}`}
                  className="group block card-luxury h-full"
                >
                  <div className="aspect-square img-zoom bg-secondary/20 rounded-2xl overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(category.image_url || "/placeholder.svg", { width: 400 })}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 md:p-5 text-center">
                    <h3 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors uppercase tracking-wider">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </CarouselItem>
            ))}
            
            {!categories.some(c => c.is_highlight) && (
              <CarouselItem className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                <Link
                  to="/sale"
                  className="group block card-luxury bg-destructive/5 hover:bg-destructive/10 h-full"
                >
                  <div className="aspect-square flex items-center justify-center rounded-2xl overflow-hidden">
                    <div className="text-center p-6">
                      <span className="text-3xl md:text-4xl font-bold text-destructive">
                        SALE
                      </span>
                    </div>
                  </div>
                  <div className="p-3 md:p-5 text-center border-t border-destructive/10">
                    <h3 className="font-bold text-sm md:text-base text-destructive uppercase tracking-wider">
                      Khuyến Mãi
                    </h3>
                  </div>
                </Link>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
}