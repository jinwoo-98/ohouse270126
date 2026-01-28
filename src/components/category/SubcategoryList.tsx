"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { productCategories, mainCategories } from "@/constants/header-data";

interface SubcategoryListProps {
  currentSlug: string;
}

export function SubcategoryList({ currentSlug }: SubcategoryListProps) {
  // Tìm các danh mục con dựa trên slug hiện tại
  // Nếu là trang 'noi-that' hoặc các trang chung, hiển thị các phòng chính
  // Nếu là trang phòng (phong-khach), hiển thị các loại sản phẩm (sofa, ban-tra...)
  
  let items = productCategories[currentSlug] || [];
  
  // Nếu không có danh mục con (đang ở cấp sâu nhất hoặc trang tổng), 
  // hãy hiển thị các danh mục chính để người dùng dễ điều hướng
  if (items.length === 0) {
    items = mainCategories
      .filter(cat => cat.href !== "/sale" && cat.href !== "/ban-chay" && cat.href !== "/moi")
      .map(cat => ({ name: cat.name, href: cat.href }));
  }

  return (
    <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-[104px] md:top-[118px] lg:top-[141px] z-30">
      <div className="container-luxury">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
          {items.map((item, index) => {
            const isActive = item.href === `/${currentSlug}`;
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-charcoal border-charcoal text-cream shadow-medium"
                      : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}