import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice, cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";

interface InspirationLookCardProps {
  look: any;
  index: number;
  onQuickView: (product: any) => void;
}

export function InspirationLookCard({ look, index, onQuickView }: InspirationLookCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Lấy danh sách sản phẩm trong lookbook
  const productsInLook = look.shop_look_items
    .filter((item: any) => item.products)
    .map((item: any) => item.products);

  // Tạo một "sản phẩm đại diện" cho Lookbook để thêm vào Wishlist
  const lookAsProduct = {
    id: look.id,
    name: look.title,
    price: productsInLook[0]?.price || 0, // Lấy giá của sản phẩm đầu tiên làm giá đại diện
    image: look.image_url,
    slug: `y-tuong/${look.id}`,
  };
  
  const isFavorite = isInWishlist(lookAsProduct.id);
  const productCount = productsInLook.length;

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
        <Link to={`/y-tuong/${look.id}`} className="block relative w-full h-full">
          <img 
            src={look.image_url} 
            alt={look.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
          
          {/* Nút Yêu thích */}
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
            <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </button>
          
          {/* Product Count Badge (Trái dưới) */}
          <div className="absolute bottom-3 left-3 bg-charcoal/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-10">
            {productCount} SP
          </div>
        </Link>

        <TooltipProvider>
          {look.shop_look_items
            .filter((item: any) => item.target_image_url === look.image_url && item.products)
            .map((item: any) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-primary hover:scale-125 transition-all duration-500 z-20 group/dot pointer-events-auto"
                  style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault(); // Ngăn chặn chuyển trang khi click hotspot
                    if (item.products) onQuickView(item.products);
                  }}
                >
                  {/* Vòng tròn ngoài (Ping effect) */}
                  <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
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
      <div className="px-3 text-center">
        <Link to={`/y-tuong/${look.id}`}>
          <h3 className="font-bold text-charcoal text-lg group-hover:text-primary transition-colors leading-tight">{look.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">{productCount} sản phẩm phối hợp</p>
      </div>
    </motion.div>
  );
}