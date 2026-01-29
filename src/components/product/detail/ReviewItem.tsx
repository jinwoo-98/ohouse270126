"use client";

import { useState } from "react";
import { Star, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewItemProps {
  review: any;
}

export function ReviewItem({ review }: ReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150; // Giảm xuống 150 để dễ thấy nút Xem thêm
  const isLongComment = review.comment && review.comment.length > maxLength;

  return (
    <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-subtle animate-fade-in group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar mặc định từ chữ cái đầu */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/10 shadow-sm group-hover:scale-105 transition-transform">
            {review.user_name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div>
            <p className="text-sm font-bold text-charcoal">{review.user_name}</p>
            <div className="flex text-amber-400 text-[10px] mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn("w-3.5 h-3.5", i < review.rating ? 'fill-current' : 'text-gray-200')} 
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
          {new Date(review.created_at).toLocaleDateString('vi-VN')}
        </span>
      </div>

      <div className="pl-0 md:pl-15">
        <div className="relative">
          {/* Vùng nội dung với hiệu ứng mượt mà */}
          <div className={cn(
            "text-sm text-muted-foreground leading-relaxed italic transition-all duration-500",
            !isExpanded && isLongComment ? "line-clamp-3 overflow-hidden" : ""
          )}>
            "{review.comment}"
          </div>
          
          {isLongComment && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-all"
            >
              {isExpanded ? (
                <>Thu gọn <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>Xem thêm nội dung <ChevronDown className="w-3.5 h-3.5 animate-bounce" /></>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2.5 py-1 rounded-lg border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" /> Đã mua hàng tại OHOUSE
        </div>
      </div>
    </div>
  );
}