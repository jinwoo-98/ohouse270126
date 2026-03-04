import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Heart, ShoppingBag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice, cn, getOptimizedImageUrl } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface InspirationLookCardProps {
  look: any;
  index: number;
  onQuickView: (product: any) => void;
  onLookQuickView: (look: any) => void;
}

export function InspirationLookCard({ look, index, onQuickView, onLookQuickView }: InspirationLookCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();

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

        <TooltipProvider>
          {look.shop_look_items
            .filter((item: any) => item.target_image_url === displayImage && item.products)
            .map((item: any) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-20 group/dot pointer-events-auto"
                  style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    if (item.products) onQuickView(item.products);
                  }}
                >
                  <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
                  <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
                </button>
              </TooltipTrigger>
              {item.products && (
                <TooltipContent className="bg-charcoal text-cream border-none p-3 rounded-xl shadow-elevated">
                  <p className="font-bold text-[10px] uppercase tracking-wider">{item.products.name}</p>
                  <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
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