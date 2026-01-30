import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { cn, formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/product/detail/ProductReviews";
import { useIsMobile } from "@/hooks/use-mobile";

export function FeaturedProducts() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
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
        .eq('section_key', 'featured')
        .single();
      if (configData) setConfig(configData);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (product: any) => {
    if (isMobile) {
      setSelectedProduct(product);
    } else {
      navigate(`/san-pham/${product.slug || product.id}`);
    }
  };

  return (
    <section className="py-10 md:py-24 bg-secondary/30">
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
          <p className="max-w-2xl mx-auto text-sm md:text-base" style={{ color: config?.content_color }}>
            {config?.description || "Những thiết kế được yêu thích nhất"}
          </p>
          <Button variant="outline" asChild className="mt-4 md:mt-6">
            <Link to="/noi-that" className="group">
              Xem Tất Cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">Chưa có sản phẩm nổi bật nào.</div>
          ) : (
            products.map((product, index) => {
              const isFavorite = isInWishlist(product.id);
              const rating = product.fake_rating || 5;
              const reviews = product.fake_review_count || 0;
              const sold = product.fake_sold || 0;

              return (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: index * 0.05 }} 
                  viewport={{ once: true }}
                >
                  <div 
                    className="group card-luxury relative h-full flex flex-col cursor-pointer"
                    onClick={() => handleCardClick(product)}
                  >
                    <div className="relative aspect-square img-zoom">
                      <div className="block h-full">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.is_new && (
                            <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">Mới</span>
                          )}
                          {product.is_sale && (
                            <span className="bg-white text-charcoal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">Sale</span>
                          )}
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 z-10">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleWishlist({ ...product, slug: product.slug }); 
                          }} 
                          className={`p-2 md:p-2.5 rounded-full shadow-medium transition-colors ${isFavorite ? 'bg-primary text-primary-foreground' : 'bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'}`}
                        >
                          <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {!isMobile && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedProduct(product); 
                          }} 
                          className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-foreground p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-primary hover:text-primary-foreground shadow-sm items-center gap-1.5 flex"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Xem nhanh</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <div className="hidden md:flex items-center gap-1 mb-1">
                        <StarRating rating={rating} size="w-3 h-3" />
                        <span className="text-[9px] text-muted-foreground ml-1">({reviews})</span>
                      </div>
                      
                      <h3 className="font-medium text-xs md:text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                      
                      <div className="mt-auto">
                        <div className="flex items-center gap-2">
                          <p className="text-sm md:text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                          {product.original_price && (
                            <p className="text-[10px] text-muted-foreground line-through">{formatPrice(product.original_price)}</p>
                          )}
                        </div>
                        {sold > 0 && (
                          <p className="hidden md:block text-[10px] text-muted-foreground mt-1">Đã bán {sold}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}