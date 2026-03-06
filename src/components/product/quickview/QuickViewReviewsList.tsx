"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/product/detail/ProductReviews";

interface QuickViewReviewsListProps {
  productName: string;
  rating: number;
  reviews: any[];
  onBack: () => void;
}

export function QuickViewReviewsList({ productName, rating, reviews, onBack }: QuickViewReviewsListProps) {
  return (
    <motion.div
      key="reviews-list"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-background min-h-full"
    >
      <div className="sticky top-0 z-20 bg-charcoal text-cream p-6 shadow-medium">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest leading-none">Đánh Giá Thực Tế</h3>
            <p className="text-[10px] text-taupe uppercase tracking-widest mt-2">{productName}</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-white p-6 rounded-[24px] border border-border/40 shadow-subtle text-center">
          <p className="text-4xl font-bold text-charcoal mb-2">{rating}/5</p>
          <div className="flex justify-center mb-2">
            <StarRating rating={rating} size="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tổng số {reviews.length} nhận xét</p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-6 rounded-[24px] border border-border/40 shadow-subtle hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                    {rev.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-charcoal">{rev.user_name}</p>
                    <div className="mt-0.5"><StarRating rating={rev.rating} size="w-3 h-3" /></div>
                  </div>
                </div>
                <span className="text-[9px] font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                  {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{rev.comment}"</p>
              {rev.image_url && (
                <div className="mt-4 aspect-square w-24 rounded-xl overflow-hidden border border-border/60">
                   <img src={rev.image_url} className="w-full h-full object-cover" alt={`Đánh giá từ ${rev.user_name}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="py-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Bạn đã xem hết đánh giá</p>
          <Button variant="outline" className="rounded-full h-11 px-8 text-[10px] font-bold uppercase tracking-widest" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chi tiết
          </Button>
        </div>
      </div>
    </motion.div>
  );
}