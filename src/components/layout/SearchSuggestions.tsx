"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

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
  "Gỗ óc chó cao cấp",
  "Kệ tivi hiện đại",
  "Giường ngủ luxury",
  "Đèn chùm pha lê"
];

// Mock data generator để tạo đủ 6 sản phẩm cho mỗi từ khóa
const generateProducts = (keyword: string, baseImage: string, category: string): Product[] => {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `${keyword}-${i}`,
    name: `${category} Cao Cấp Mẫu ${i + 1} - ${keyword}`,
    price: 15000000 + (i * 2500000),
    image: baseImage,
    category: category
  }));
};

const PRODUCTS_MAP: Record<string, Product[]> = {
  "Sofa da thật": generateProducts("Sofa", categorySofa, "Sofa"),
  "Bàn ăn mặt đá": generateProducts("Bàn Ăn", categoryDiningTable, "Bàn Ăn"),
  "Gỗ óc chó cao cấp": generateProducts("Nội Thất Gỗ", categoryTvStand, "Kệ Tivi"),
  "Kệ tivi hiện đại": generateProducts("Kệ Tivi", categoryTvStand, "Kệ Tivi"),
  "Giường ngủ luxury": generateProducts("Giường Ngủ", categoryBed, "Giường"),
  "Đèn chùm pha lê": generateProducts("Đèn Trang Trí", categoryLighting, "Đèn"),
};

export function SearchSuggestions({ isVisible, onClose, onKeywordClick }: SearchSuggestionsProps) {
  const [activeKeyword, setActiveKeyword] = useState(POPULAR_KEYWORDS[0]);

  if (!isVisible) return null;

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const currentProducts = PRODUCTS_MAP[activeKeyword] || PRODUCTS_MAP[POPULAR_KEYWORDS[0]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-[-20px] right-[-20px] md:left-[-100px] md:right-[-100px] lg:left-0 lg:right-0 mt-2 bg-card border border-border shadow-elevated rounded-xl overflow-hidden z-[100] hidden md:block"
    >
      <div className="flex h-[600px]">
        {/* Cột 1: Từ khóa phổ biến */}
        <div className="w-1/3 bg-secondary/30 p-6 border-r border-border flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Từ khóa phổ biến
          </h3>
          
          <div className="flex-1 space-y-1">
            {POPULAR_KEYWORDS.map((keyword) => (
              <div
                key={keyword}
                onMouseEnter={() => setActiveKeyword(keyword)}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => onKeywordClick(keyword)}
                  className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-between font-medium group ${
                    activeKeyword === keyword 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "hover:bg-background hover:text-primary text-foreground/80"
                  }`}
                >
                  {keyword}
                  {activeKeyword === keyword && (
                    <ArrowRight className="w-4 h-4 animate-in slide-in-from-left-2 fade-in duration-300" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-border/50">
             <div className="bg-background rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-sm">Thiết kế riêng?</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Nhận tư vấn thiết kế nội thất miễn phí từ chuyên gia.</p>
                <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                  <Link to="/thiet-ke" onClick={onClose}>Đăng ký ngay</Link>
                </Button>
             </div>
          </div>
        </div>

        {/* Cột 2: Sản phẩm tương ứng (2 cột x 3 hàng) */}
        <div className="w-2/3 p-6 bg-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Gợi ý cho "{activeKeyword}"
            </h3>
            <Link 
              to={`/tim-kiem?q=${activeKeyword}`}
              onClick={onClose}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả kết quả
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
            <AnimatePresence mode="wait">
              {currentProducts.map((product, index) => (
                <motion.div
                  key={`${activeKeyword}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/san-pham/${product.id}`}
                    onClick={onClose}
                    className="flex gap-4 group h-full bg-background rounded-lg border border-border/50 p-2 hover:border-primary/50 hover:shadow-subtle transition-all"
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex flex-col justify-center py-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-1">
                        {product.name}
                      </h4>
                      <p className="text-primary font-bold text-sm mt-auto">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}