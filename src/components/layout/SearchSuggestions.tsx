"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  "Gỗ óc chó cao cấp",
  "Kệ tivi hiện đại",
  "Giường ngủ luxury",
  "Đèn chùm pha lê Ý"
];

const TRENDING_CATEGORIES = [
  { name: "Phòng Khách Luxury", href: "/phong-khach" },
  { name: "Bàn Ăn Thông Minh", href: "/ban-an" },
  { name: "Decor Ánh Sáng", href: "/den-trang-tri" },
  { name: "Nội Thất Gỗ Sồi", href: "/noi-that" }
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-[-150px] md:left-[-300px] right-[-150px] md:right-[-400px] mt-3 bg-card border border-border shadow-elevated rounded-2xl overflow-hidden z-[60] hidden md:block"
    >
      <div className="flex min-h-[450px]">
        {/* Cột 1: Từ khóa & Xu hướng */}
        <div className="w-1/4 bg-secondary/20 p-8 border-r border-border">
          <div className="mb-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Từ khóa phổ biến
            </h3>
            <div className="space-y-2">
              {POPULAR_KEYWORDS.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => onKeywordClick(keyword)}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-all group flex items-center justify-between font-medium"
                >
                  {keyword}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              Danh mục gợi ý
            </h3>
            <div className="space-y-2">
              {TRENDING_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  onClick={onClose}
                  className="block px-3 py-2 text-sm text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Cột 2 & 3: Sản phẩm nổi bật */}
        <div className="w-3/4 p-8 bg-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Sản phẩm đề cử cho bạn
            </h3>
            <Link 
              to="/noi-that" 
              onClick={onClose}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5"
            >
              Xem tất cả bộ sưu tập
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {SUGGESTED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/${product.id}`}
                onClick={onClose}
                className="group block space-y-4"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border shadow-subtle">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-primary font-bold text-base">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer of search suggestions */}
          <div className="mt-12 p-5 bg-secondary/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">Tư vấn thiết kế riêng biệt?</p>
                <p className="text-[11px] text-muted-foreground">Kiến trúc sư của chúng tôi sẵn sàng hỗ trợ bạn miễn phí.</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-[10px] h-8 font-bold uppercase tracking-widest" asChild>
              <Link to="/thiet-ke" onClick={onClose}>Liên hệ tư vấn</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}