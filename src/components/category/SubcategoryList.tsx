"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { productCategories } from "@/constants/header-data";

interface SubcategoryListProps {
  currentSlug: string;
}

export function SubcategoryList({ currentSlug }: SubcategoryListProps) {
  // Lấy danh sách danh mục con của slug hiện tại
  const items = productCategories[currentSlug] || [];
  
  // Nếu không có danh mục con (là cấp cuối cùng), ẩn luôn phần này theo yêu cầu
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h4 className="font-bold mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Danh mục liên quan</h4>
      <div className="flex flex-col gap-1">
        {items.map((item, index) => {
          const isActive = item.href === `/${currentSlug}`;
          
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
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}