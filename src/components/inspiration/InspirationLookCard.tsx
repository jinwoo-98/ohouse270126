import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";

interface InspirationLookCardProps {
  look: any;
  index: number;
  onQuickView: (product: any) => void;
}

export function InspirationLookCard({ look, index, onQuickView }: InspirationLookCardProps) {
  return (
    <motion.div
      key={look.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      layout
      className="group flex flex-col gap-5"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-subtle group-hover:shadow-elevated transition-all duration-500">
        <Link to={`/y-tuong/${look.id}`}>
          <img 
            src={look.image_url} 
            alt={look.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
        </Link>
        
        <TooltipProvider>
          {look.shop_look_items
            .filter((item: any) => item.target_image_url === look.image_url && item.products)
            .map((item: any) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-300 z-20 group/dot"
                  style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (item.products) onQuickView(item.products);
                  }}
                >
                  {/* Vòng tròn ngoài (Ping effect) */}
                  <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-75 group-hover/dot:hidden" />
                  {/* Vòng tròn trong (Hotspot chính) */}
                  <span className="relative w-6 h-6 rounded-full bg-white/95 backdrop-blur-sm border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-200 group-hover/dot:bg-primary group-hover/dot:text-white">
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-charcoal text-cream border-none p-3 rounded-xl shadow-elevated">
                <p className="font-bold text-[10px] uppercase tracking-wider">{item.products.name}</p>
                <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      <div className="px-3 text-center">
        <h3 className="font-bold text-charcoal text-lg group-hover:text-primary transition-colors leading-tight">{look.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{look.shop_look_items?.length || 0} sản phẩm phối hợp</p>
      </div>
    </motion.div>
  );
}