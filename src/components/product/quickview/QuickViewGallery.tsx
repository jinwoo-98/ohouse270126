"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, generateProductAltText } from "@/lib/utils";

interface QuickViewGalleryProps {
  product: any;
  activeImage: string;
  activeGallery: string[];
  onSelectImage: (url: string) => void;
}

export function QuickViewGallery({ product, activeImage, activeGallery, onSelectImage }: QuickViewGalleryProps) {
  if (!product) return null;

  return (
    <div className="space-y-0">
      <div className="relative aspect-square bg-secondary/20 overflow-hidden">
        <img 
          src={activeImage} 
          alt={generateProductAltText(product)} 
          className="w-full h-full object-cover transition-all duration-500" 
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-primary text-white uppercase tracking-widest text-[9px] font-bold border-none px-3 py-1 shadow-sm">
            {product.category_id?.replace(/-/g, ' ')}
          </Badge>
        </div>
      </div>

      {activeGallery.length > 1 && (
        <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar bg-white border-b border-border/40">
          {activeGallery.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelectImage(img)}
              className={cn(
                "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                activeImage === img ? "border-primary ring-2 ring-primary/10" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} className="w-full h-full object-cover" alt={`${product.name} - Ảnh ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}