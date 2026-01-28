"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { productCategories, mainCategories } from "@/constants/header-data";

interface SubcategoryListProps {
  currentSlug: string;
}

export function SubcategoryList({ currentSlug }: SubcategoryListProps) {
  let items = productCategories[currentSlug] || [];
  
  if (items.length === 0) {
    items = mainCategories
      .filter(cat => cat.href !== "/sale" && cat.href !== "/ban-chay" && cat.href !== "/moi")
      .map(cat => ({ name: cat.name, href: cat.href }));
  }

  return (
    <div className="mb-8">
      <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">Danh Mục</h4>
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
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary text-foreground/70 hover:text-primary"
                }`}
              >
                <span>{item.name}</span>
                <div className={`w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300 ${isActive ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-50"}`} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}