import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";

interface ShopTheLookCardProps {
  look: any;
  onQuickView: (product: any) => void;
}

export function ShopTheLookCard({ look, onQuickView }: ShopTheLookCardProps) {
  return (
    <div className="col-span-2 group relative aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden shadow-subtle hover:shadow-medium transition-all duration-500">
      <Link to={`/y-tuong/${look.id}`} className="absolute inset-0 z-10">
        <img 
          src={look.image_url} 
          alt={look.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent" />
        
        {/* Tiêu đề đã bị ẩn */}
      </Link>
      
      {/* Hotspots Overlay */}
      <TooltipProvider>
        {look.shop_look_items
          .filter((item: any) => item.target_image_url === look.image_url && item.products)
          .map((item: any) => (
          <Tooltip key={item.id} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-20 group/dot"
                style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                onClick={(e) => { 
                  e.preventDefault(); // Ngăn chặn chuyển trang
                  e.stopPropagation(); 
                  if (item.products) onQuickView(item.products);
                }}
              >
                {/* Vòng tròn ngoài (Ping effect) */}
                <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-30 group-hover/dot:hidden" />
                {/* Vòng tròn trong (Hotspot chính) */}
                <span className="relative w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg transition-all duration-500 group-hover/dot:bg-primary group-hover/dot:border-white" />
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
  );
}