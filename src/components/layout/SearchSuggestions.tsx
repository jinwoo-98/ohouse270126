"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, Search, ShoppingBag } from "lucide-react";
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

const generateProducts = (keyword: string, baseImage: string, category: string): Product[] => {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `${keyword}-${i}`,
    name: `${category} ${keyword} - Mẫu thiết kế ${i + 1}`,
    price: 18500000 + (i * 3200000),
    image: baseImage,
    category: category
  }));
};

const PRODUCTS_MAP: Record<string, Product[]> = {
  "Sofa da thật": generateProducts("Luxury", categorySofa, "Sofa"),
  "Bàn ăn mặt đá": generateProducts("Modern", categoryDiningTable, "Bàn Ăn"),
  "Gỗ óc chó cao cấp": generateProducts("Walnut", categoryTvStand, "Kệ Tivi"),
  "Kệ tivi hiện đại": generateProducts("Minimalist", categoryTvStand, "Kệ Tivi"),
  "Giường ngủ luxury": generateProducts("Grand", categoryBed, "Giường"),
  "Đèn chùm pha lê": generateProducts("Crystal", categoryLighting, "Đèn"),
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 mt-3 bg-card border border-border/60 shadow-elevated rounded-2xl overflow-hidden z-[100] hidden md:block w-[750px] -ml-20 lg:ml-0"
    >
      <div className="flex h-[550px]">
        {/* Left Column: Keywords */}
        <div className="w-[280px] bg-secondary/20 p-6 border-r border-border/40 flex flex-col">
          <div className="mb-6 flex items-center gap-2 px-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Tìm kiếm phổ biến
            </h3>
          </div>
          
          <div className="flex-1 space-y-1">
            {POPULAR_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onMouseEnter={() => setActiveKeyword(keyword)}
                onClick={() => onKeywordClick(keyword)}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center justify-between group font-medium ${
                  activeKeyword === keyword 
                    ? "bg-primary text-primary-foreground shadow-gold" 
                    : "hover:bg-background text-foreground/70 hover:text-primary"
                }`}
              >
                {keyword}
                <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                  activeKeyword === keyword ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                }`} />
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Dịch vụ đặc biệt</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Bạn muốn một thiết kế riêng cho căn hộ của mình?
            </p>
            <Button variant="link" className="p-0 h-auto text-[11px] font-bold text-charcoal hover:text-primary transition-colors group" asChild>
              <Link to="/thiet-ke" onClick={onClose}>
                ĐĂNG KÝ TƯ VẤN 3D
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Column: Products Grid */}
        <div className="flex-1 p-6 bg-card flex flex-col">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Gợi ý cho "{activeKeyword}"
              </h3>
            </div>
            <Link 
              to={`/tim-kiem?q=${activeKeyword}`}
              onClick={onClose}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              Xem tất cả
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {currentProducts.map((product, index) => (
                <motion.div
                  key={`${activeKeyword}-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/san-pham/${product.id}`}
                    onClick={onClose}
                    className="flex gap-3 group h-full bg-background rounded-xl border border-border/40 p-2.5 hover:border-primary/40 hover:shadow-subtle transition-all duration-300"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex flex-col justify-center py-1 overflow-hidden">
                      <span className="text-[9px] uppercase text-primary/70 font-bold tracking-widest mb-1">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1.5 leading-snug">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-charcoal font-bold text-sm">
                          {formatPrice(product.price)}
                        </p>
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                           <ShoppingBag className="w-3 h-3" />
                        </div>
                      </div>
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