"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, cn, getOptimizedImageUrl } from "@/lib/utils";

interface LookProductVerticalItemProps {
  product: any;
  onQuickView: (product: any) => void;
  className?: string;
  imageClassName?: string;
  infoClassName?: string;
  isActive?: boolean;
}

export function LookProductVerticalItem({ 
  product, 
  onQuickView, 
  className, 
  imageClassName, 
  infoClassName,
  isActive 
}: LookProductVerticalItemProps) {
  
  const originalImage = product.image_url || '/placeholder.svg';
  const [imgSrc, setImgSrc] = useState(getOptimizedImageUrl(originalImage, { width: 300 }));

  const handleImageError = () => {
    setImgSrc(originalImage);
  };

  return (
    <div 
      className={cn(
        "group flex flex-col overflow-hidden border transition-all cursor-pointer bg-card",
        isActive ? "border-primary ring-2 ring-primary/20 shadow-medium scale-[1.02]" : "border-border/40 hover:shadow-subtle",
        className
      )}
      onClick={() => onQuickView(product)}
    >
      {/* Image Section */}
      <Link to={`/san-pham/${product.slug || product.id}`} onClick={(e) => e.stopPropagation()} className={cn(
        "relative aspect-square overflow-hidden bg-secondary/30 shrink-0", 
        imageClassName
      )}>
        <img 
          src={imgSrc} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={handleImageError}
        />
        
        <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
      </Link>
      
      {/* Info Section */}
      <div className={cn("p-2 flex flex-col items-center text-center", infoClassName)}>
        <p className={cn(
          "font-bold text-sm leading-none transition-colors",
          isActive ? "text-primary" : "text-charcoal"
        )}>
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}