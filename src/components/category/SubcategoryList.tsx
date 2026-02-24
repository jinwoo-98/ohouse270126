"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface SubcategoryListProps {
  currentSlug: string;
}

export function SubcategoryList({ currentSlug }: SubcategoryListProps) {
  const { data, isLoading } = useCategories();
  
  if (isLoading) return null;

  const productCategoriesMap = data?.productCategories || {};
  const items = productCategoriesMap[currentSlug] || [];
  
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 animate-fade-in">
      <h4 className="font-bold mb-4 text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-muted-foreground px-1">Danh mục liên quan</h4>
      
      {/* Container cuộn ngang trên mobile, danh sách dọc trên desktop */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto no-scrollbar-x pb-2 md:pb-0 -mx-1 px-1 touch-pan-x">
        {items.map((item, index) => {
          const itemSlug = item.href.replace(/^\//, '');
          const isActive = itemSlug === currentSlug;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="shrink-0 md:shrink"
            >
              <Link
                to={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-2 md:px-0 md:py-2 text-xs md:text-sm font-bold md:font-medium transition-all rounded-full md:rounded-none border md:border-none whitespace-nowrap",
                  isActive
                    ? "text-primary border-primary bg-primary/5 md:bg-transparent"
                    : "text-foreground/60 border-border hover:text-primary hover:border-primary/40"
                )}
              >
                <span>{item.name}</span>
                <div className={cn(
                  "hidden md:block w-1 h-1 rounded-full bg-primary transition-all",
                  isActive ? 'opacity-100' : 'opacity-0'
                )} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}