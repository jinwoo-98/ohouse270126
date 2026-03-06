import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ChevronRight as ArrowIcon } from "lucide-react";
import { formatPrice, cn, getOptimizedImageUrl } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";

interface InspirationLookCardProps {
  look: any;
  index: number;
  onQuickView: (product: any) => void;
  onLookQuickView: (look: any) => void;
}

export function InspirationLookCard({ look, index, onQuickView, onLookQuickView }: InspirationLookCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  const uniqueProducts = useMemo(() => {
    const products = look.shop_look_items
      ?.filter((item: any) => item.products)
      .map((item: any) => item.products) || [];
    return Array.from(new Map(products.map((p: any) => [p.id, p])).values()) as any[];
  }, [look.shop_look_items]);

  const lookAsProduct = {
    id: look.id,
    name: look.title,
    price: uniqueProducts[0]?.price || 0,
    image: look.image_url,
    slug: look.slug,
  };
  
  const isFavorite = isInWishlist(lookAsProduct.id);
  const productCount = uniqueProducts.length;

  const detailLink = `/y-tuong/${look.slug || look.id}`;
  const displayImage = look.homepage_image_url || look.image_url;

  return (
    <motion.div
      key={look.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      layout
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden shadow-subtle group-hover:shadow-elevated transition-all duration-500">
        <Link to={detailLink} className="block relative w-full h-full">
          <img 
            src={getOptimizedImageUrl(displayImage, { width: 1000 })} 
            alt={look.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = displayImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
          
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              e.preventDefault();
              toggleWishlist(lookAsProduct); 
            }}
            className={cn(
              "absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm",
              isFavorite 
                ? "bg-primary text-white" 
                : "bg-white/80 text-charcoal hover:bg-primary hover:text-white"
            )}
            title="Thêm vào yêu thích"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
          
          <div className="absolute bottom-3 left-3 bg-charcoal/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-10">
            {productCount} SP
          </div>
        </Link>

        {/* Hotspots với hiệu ứng dính và line 1px */}
        {look.shop_look_items
          ?.filter((item: any) => item.target_image_url === displayImage && item.products)
          .map((item: any) => {
            const isActive = activeHotspotId === item.id;
            return (
              <div 
                key={item.id}
                className="absolute z-30 transition-all duration-500"
                style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
              >
                <button
                  className="group relative w-8 h-8 -ml-4 -mt-4 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 z-30"
                  onMouseEnter={() => setActiveHotspotId(item.id)}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full bg-white transition-all duration-300",
                    isActive ? "scale-[0.67]" : "scale-100"
                  )} />
                  <div className={cn(
                    "absolute inset-0 rounded-full border-white transition-all duration-300",
                    isActive ? "opacity-100 border-[1px]" : "opacity-0 border-0"
                  )} />
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-12 flex items-center shadow-elevated rounded-xl overflow-visible z-50 bg-white"
                      style={{ left: '-21px' }}
                    >
                      <div 
                        className="absolute top-full w-[1px] h-12 bg-white pointer-events-none shadow-sm z-50" 
                        style={{ left: '21px', transform: 'translateX(-50%)' }}
                      />
                      <div className="w-[143px] h-[72px] bg-white p-3 flex flex-col justify-center text-left border-r border-border/40 rounded-l-xl">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate mb-1">
                          {item.products.category_id?.replace(/-/g, ' ') || "Sản phẩm"}
                        </p>
                        <p className="text-sm font-bold text-primary truncate">
                          {formatPrice(item.products.price)}
                        </p>
                      </div>
                      <button
                        className="w-[24px] h-[72px] bg-white flex items-center justify-center text-primary hover:bg-primary/5 transition-colors rounded-r-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onQuickView(item.products);
                        }}
                      >
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </div>
      
      <Button 
        onClick={() => onLookQuickView(look)}
        className="w-full h-12 rounded-xl bg-secondary/50 hover:bg-primary hover:text-white text-charcoal border border-border/40 shadow-sm transition-all font-bold text-[10px] uppercase tracking-widest gap-2"
      >
        <ShoppingBag className="w-4 h-4" /> XEM NHANH SẢN PHẨM TRONG KHÔNG GIAN
      </Button>
    </motion.div>
  );
}