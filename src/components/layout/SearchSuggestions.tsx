"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, Search, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SearchSuggestionsProps {
  isVisible: boolean;
  onClose: () => void;
  onKeywordClick: (keyword: string) => void;
  searchQuery?: string;
}

const POPULAR_KEYWORDS = [
  "Sofa da thật",
  "Bàn ăn mặt đá",
  "Gỗ óc chó cao cấp",
  "Kệ tivi hiện đại",
  "Giường ngủ luxury",
  "Đèn chùm pha lê"
];

export function SearchSuggestions({ isVisible, onClose, onKeywordClick, searchQuery = "" }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, category_id')
        .ilike('name', `%${query}%`)
        .limit(4);
      
      setSuggestions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 mt-3 w-[600px] bg-card border border-border/60 shadow-elevated rounded-2xl overflow-hidden z-[100] hidden md:block"
    >
      <div className="flex min-h-[300px]">
        {/* Left Column: Keywords */}
        <div className="w-1/2 bg-secondary/20 p-6 border-r border-border/40">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Tìm kiếm phổ biến
            </h3>
          </div>
          <div className="space-y-1">
            {POPULAR_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => onKeywordClick(keyword)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-background hover:text-primary transition-all flex items-center justify-between group font-medium"
              >
                {keyword}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Suggestions */}
        <div className="flex-1 p-6">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {searchQuery.length > 1 ? "Sản phẩm gợi ý" : "Sản phẩm nổi bật"}
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  to={`/san-pham/${product.id}`}
                  onClick={onClose}
                  className="flex gap-4 group"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border/40">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{product.category_id}</p>
                    <p className="text-sm font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery.length > 1 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">Không tìm thấy sản phẩm phù hợp.</div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs">Nhập từ khóa để tìm kiếm...</div>
          )}
          
          <Button variant="link" className="mt-6 p-0 h-auto text-[10px] font-bold text-charcoal hover:text-primary group" asChild>
            <Link to="/noi-that" onClick={onClose}>
              XEM TẤT CẢ SẢN PHẨM 
              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}