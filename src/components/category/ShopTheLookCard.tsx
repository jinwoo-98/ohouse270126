import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight as ArrowIcon } from "lucide-react";
import { formatPrice, getOptimizedImageUrl, cn } from "@/lib/utils";

interface ShopTheLookCardProps {
  look: any;
  onQuickView: (product: any) => void;
}

export function ShopTheLookCard({ look, onQuickView }: ShopTheLookCardProps) {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const detailLink = `/y-tuong/${look.slug || look.id}`;

  return (
    <div className="col-span-2 group relative aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden shadow-subtle hover:shadow-medium transition-all duration-500">
      <Link to={detailLink} className="absolute inset-0 z-10">
        <img 
          src={getOptimizedImageUrl(look.image_url, { width: 1000 })} 
          alt={look.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = look.image_url; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent" />
      </Link>
      
      {/* Hotspots Overlay với hiệu ứng dính và line 1px */}
      {look.shop_look_items
        ?.filter((item: any) => item.target_image_url === look.image_url && item.products)
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
  );
}