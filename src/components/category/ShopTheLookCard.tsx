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
    <div className="md:col-span-2 group relative aspect-video md:aspect-[2/1] rounded-3xl overflow-hidden shadow-subtle hover:shadow-medium transition-all duration-500">
      <Link to={`/y-tuong/${look.id}`}>
        <img 
          src={look.image_url} 
          alt={look.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent" />
        
        {/* Hotspots Overlay - Chỉ hiển thị hotspot gán cho ảnh chính (image_url) */}
        <TooltipProvider>
          {look.shop_look_items
            .filter((item: any) => item.target_image_url === look.image_url && item.products)
            .map((item: any) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className="absolute w-8 h-8 -ml-4 -mt-4 bg-white/95 backdrop-blur-sm border-2 border-primary rounded-full shadow-gold flex items-center justify-center text-primary hover:scale-125 transition-all animate-fade-in z-20 group/dot"
                  style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                  onClick={(e) => { 
                    e.preventDefault(); // Ngăn chặn chuyển trang
                    e.stopPropagation(); 
                    if (item.products) onQuickView(item.products);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-75 group-hover/dot:hidden" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-charcoal text-cream border-none p-3 rounded-xl shadow-elevated">
                <p className="font-bold text-[10px] uppercase tracking-wider">{item.products.name}</p>
                <p className="text-primary font-bold text-xs mt-1">{formatPrice(item.products.price)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {/* Footer Text - Giữ lại để hiển thị thông tin Lookbook */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Shop The Look</span>
          <h3 className="text-lg md:text-xl font-bold leading-tight group-hover:text-primary transition-colors">{look.title}</h3>
          <div className="flex items-center gap-2 text-xs font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Khám phá ngay <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}