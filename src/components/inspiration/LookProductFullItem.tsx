"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice, cn, getOptimizedImageUrl, generateProductAltText, generateImageSrcSet } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LookProductFullItemProps {
  product: any;
  onQuickView: (product: any) => void;
}

export function LookProductFullItem({ product, onQuickView }: LookProductFullItemProps) {
  const isMobile = useIsMobile();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const originalImage = product.image_url || '/placeholder.svg';
  const [imgSrc, setImgSrc] = useState(getOptimizedImageUrl(originalImage, { width: 400 }));
  const [imgSrcSet, setImgSrcSet] = useState(generateImageSrcSet(originalImage, [300, 400, 600]));
  
  const isFavorite = isInWishlist(product.id);
  const smartAlt = generateProductAltText(product);
  const imageSizes = "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw";

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      onQuickView(product);
    } else {
      navigate(`/san-pham/${product.slug || product.id}`);
    }
  };

  const handleImageError = () => {
    setImgSrc(originalImage);
    setImgSrcSet("");
  };

  return (
    <div 
      className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border/40 hover:shadow-subtle transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/30 shrink-0">
        <img 
          src={imgSrc} 
          srcSet={imgSrcSet || undefined}
          sizes={imageSizes}
          alt={smartAlt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={handleImageError}
        />
        
        <button 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            toggleWishlist({ ...product, slug: product.slug }); 
          }}
          className={cn(
            "absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-medium backdrop-blur-sm",
            isFavorite 
              ? "bg-primary text-white" 
              : "bg-white/80 text-charcoal hover:bg-primary hover:text-white"
          )}
          title="Yêu thích"
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>

        {!isMobile && (
          <div className="absolute bottom-3 left-3 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              className="h-9 px-4 rounded-xl flex items-center justify-center bg-charcoal/90 backdrop-blur-md text-white hover:bg-primary transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
              title="Xem nhanh"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> XEM NHANH
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1 items-center text-center pt-4">
        <Link to={`/san-pham/${product.slug || product.id}`} onClick={(e) => e.preventDefault()}>
          <h3 className="text-xs md:text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10 flex items-center justify-center mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
          <p className="text-sm md:text-base font-bold text-primary">{formatPrice(product.price)}</p>
          {product.original_price && (
            <span className="text-[10px] md:text-xs text-muted-foreground line-through opacity-50">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}