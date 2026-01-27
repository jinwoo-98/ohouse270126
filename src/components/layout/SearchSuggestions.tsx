"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
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
  "Giường ngủ bọc da",
  "Bàn trà tròn",
  "Đèn chùm pha lê",
  "Bàn làm việc gỗ"
];

const SUGGESTED_PRODUCTS: Product[] = [
  { id: 1, name: "Kệ Tivi Gỗ Óc Chó", price: 25990000, image: categoryTvStand, category: "Kệ Tivi" },
  { id: 2, name: "Sofa Góc Da Ý", price: 45990000, image: categorySofa, category: "Sofa" },
  { id: 3, name: "Bàn Ăn Marble", price: 32990000, image: categoryDiningTable, category: "Bàn Ăn" },
  { id: 4, name: "Bàn Trà Kính", price: 12990000, image: categoryCoffeeTable, category: "Bàn Trà" },
  { id: 5, name: "Bàn Làm Việc Sồi", price: 18990000, image: categoryDesk, category: "Văn Phòng" },
  { id: 6, name: "Giường Ngủ Luxury", price: 38990000, image: categoryBed, category: "Phòng Ngủ" },
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
      className="absolute top-full left-[-20px] md:left-[-150px] lg:left-[-250px] right-[-20px] md:right-[-150px] lg:right-[-350px] mt-2 bg-card border border-border/50 shadow-2xl rounded-xl overflow-hidden z-[100] hidden md:block"
    >
      <div className="flex h-[550px]">
        {/* Cột trái: Từ khóa phổ biến */}
        <div className="w-1/3 bg-secondary/30 p-6 border-r border-border/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Từ khóa phổ biến
          </h3>
          <div className="space-y-1">
            {POPULAR_KEYWORDS.map((keyword, index) => (
              <button
                key={keyword}
                onClick={() => onKeywordClick(keyword)}
                className="w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-white hover:shadow-sm hover:text-primary transition-all group flex items-center justify-between font-medium text-foreground/80"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/50 w-4 text-center">{index + 1}</span>
                  {keyword}
                </div>
                <Search className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/50">
             <Link 
              to="/noi-that" 
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Xem tất cả danh mục
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Cột phải: Lưới sản phẩm gợi ý */}
        <div className="w-2/3 p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Sản phẩm nổi bật
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 h-full content-start">
            {SUGGESTED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/${product.id}`}
                onClick={onClose}
                className="group flex gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/50"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">{product.category}</span>
                  <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-primary font-bold text-sm mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}