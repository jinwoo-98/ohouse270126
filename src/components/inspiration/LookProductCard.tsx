"use client";

import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";

interface LookProductCardProps {
  product: any;
  onQuickView: (product: any) => void;
}

export function LookProductCard({ product, onQuickView }: LookProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  // Xử lý click vào toàn bộ thẻ để mở QuickView
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickView(product);
  };

  return (
    <div 
      className="group flex flex-col bg-transparent rounded-xl overflow-hidden h-full cursor-pointer"
      onClick={handleCardClick} // Bắt sự kiện click trên toàn bộ thẻ
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-secondary/15 shrink-0 rounded-xl">
        {/* Thay Link bằng div để click vào ảnh cũng kích hoạt handleCardClick */}
        <div className="block h-full w-full">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        </div>

        {/* Overlay đã bị loại bỏ */}
      </div>

      {/* Info Section (Tối giản: Chỉ còn giá) */}
      <div className="p-2 flex flex-col items-center text-center flex-1 pt-3">
        <div className="flex items-center justify-center gap-2 mt-auto">
          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}