"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/useCategories";

interface SubcategoryListProps {
  currentSlug: string;
}

export function SubcategoryList({ currentSlug }: SubcategoryListProps) {
  const { data, isLoading } = useCategories();
  
  if (isLoading) return null;

  // Lấy danh sách danh mục con của slug hiện tại từ dữ liệu thật của DB
  const productCategoriesMap = data?.productCategories || {};
  const items = productCategoriesMap[currentSlug] || [];
  
  // Nếu không có danh mục con trong database, ẩn luôn phần "Danh mục liên quan"
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 animate-fade-in">
      <h4 className="font-bold mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Danh mục liên quan</h4>
      <div className="flex flex-col gap-1">
        {items.map((item, index) => {
          // Xử lý so sánh href chính xác
          const itemSlug = item.href.replace(/^\//, '');
          const isActive = itemSlug === currentSlug;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={item.href}
                className={`group flex items-center justify-between px-0 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                <span>{item.name}</span>
                <div className={`w-1 h-1 rounded-full bg-primary transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}