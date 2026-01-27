"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
}

interface SearchSuggestionsProps {
  isVisible: boolean;
  onClose: () => void;
  onKeywordClick: (keyword: string) => void;
}

const POPULAR_KEYWORDS = [
  "Sofa da thật",
  "Bàn ăn mặt đá",
  "Gỗ óc chó",
  "Kệ tivi hiện đại",
  "Giường ngủ luxury",
  "Đèn chùm pha lê"
];

const SUGGESTED_PRODUCTS: Product[] = [
  { id: 1, name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá", price: 25990000, image: "https://kyfzqgyazmjtnxjdvetr.supabase.co/storage/v1/object/public/product-images/category-tv-stand.jpg" },
  { id: 2, name: "Sofa Góc Chữ L Vải Nhung Ý", price: 45990000, image: "https://kyfzqgyazmjtnxjdvetr.supabase.co/storage/v1/object/public/product-images/category-sofa.jpg" },
  { id: 3, name: "Bàn Ăn Mặt Đá Marble 6 Ghế", price: 32990000, image: "https://kyfzqgyazmjtnxjdvetr.supabase.co/storage/v1/object/public/product-images/category-dining-table.jpg" },
];

export function SearchSuggestions({ isVisible, onClose, onKeywordClick }: SearchSuggestionsProps) {
  if (!isVisible) return null;

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-elevated rounded-xl overflow-hidden z-[60] hidden md:block"
    >
      <div className="flex h-[350px]">
        {/* Left Column: Keywords */}
        <div className="w-1/3 bg-secondary/30 p-6 border-r border-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Tìm kiếm phổ biến
          </h3>
          <div className="space-y-1">
            {POPULAR_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => onKeywordClick(keyword)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group flex items-center justify-between"
              >
                {keyword}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Suggested Products */}
        <div className="w-2/3 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Sản phẩm gợi ý
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {SUGGESTED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/${product.id}`}
                onClick={onClose}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary transition-colors group"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-border">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-primary font-bold text-sm mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <Link 
              to="/noi-that" 
              onClick={onClose}
              className="text-xs font-bold text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-2"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}