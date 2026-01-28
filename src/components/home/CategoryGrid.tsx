import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Section Config
      const { data: configData } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'categories')
        .single();
      if (configData) setConfig(configData);

      // 2. Fetch Categories
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
    <section className="py-10 md:py-24">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/${category.slug}`}
                className="group block card-luxury h-full"
              >
                <div className="aspect-square img-zoom bg-secondary/20">
                  <img
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 md:p-5 text-center">
                  <h3 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors uppercase tracking-wider">
                    {category.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {!categories.some(c => c.is_highlight) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categories.length * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to="/sale"
                className="group block card-luxury bg-destructive/5 hover:bg-destructive/10 h-full"
              >
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-center p-6">
                    <span className="text-3xl md:text-5xl font-bold text-destructive">
                      SALE
                    </span>
                    <p className="mt-2 text-xs md:text-sm text-destructive/80 font-bold uppercase tracking-widest">
                      Giảm đến 50%
                    </p>
                  </div>
                </div>
                <div className="p-3 md:p-5 text-center border-t border-destructive/10">
                  <h3 className="font-bold text-sm md:text-base text-destructive uppercase tracking-wider">
                    Khuyến Mãi
                  </h3>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}