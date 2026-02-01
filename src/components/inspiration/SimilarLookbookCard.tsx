"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Plus, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice, cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";

interface SimilarLookbookCardProps {
  look: any;
  index: number;
  onQuickView: (product: any) => void;
}

export function SimilarLookbookCard({ look, index, onQuickView }: SimilarLookbookCardProps) {
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group flex flex-col bg-transparent rounded-2xl overflow-hidden h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/15 shrink-0 rounded-2xl shadow-subtle group-hover:shadow-medium transition-all duration-500">
        <Link to={`/y-tuong/${look.id}`} className="block h-full w-full">
          <img 
            src={look.image_url} 
            alt={look.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
        </Link>
        
        {/* Nút Yêu thích */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            e.preventDefault();
            toggleWishlist(lookAsProduct); 
          }}
          className={cn(
            "absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm",
            isFavorite 
              ? "bg-primary text-white" 
              : "bg-white/80 text-charcoal hover:bg-primary hover:text-white"
          )}
          title="Thêm vào yêu thích"
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
        
        {/* Hotspots */}
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
                    e.stopPropagation(); 
                    e.preventDefault();
                    if (item.products) onQuickView(item.products);
                  }}
                >
                  <span className="absolute w-full h-full rounded-full bg-primary/40 animate-ping opacity-100 group-hover/dot:hidden" />
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
        
        {/* Product Count Badge */}
        <div className="absolute bottom-3 left-3 bg-charcoal/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {productCount} SP
        </div>
      </div>
      
      {/* Info Section (Tên và nút khám phá) */}
      <div className="p-4 text-center">
        <h3 className="text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10">
          {look.title}
        </h3>
        <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest text-primary mt-2 group" asChild>
          <Link to={`/y-tuong/${look.id}`}>
            Khám phá <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}