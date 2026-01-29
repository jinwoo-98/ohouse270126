"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  return (
    <section className="mb-20 scroll-mt-28" id="description">
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-3">
           <Sparkles className="w-4 h-4 text-primary animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Thông tin chi tiết</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-widest text-charcoal text-center leading-tight">
          Khám Phá Sản Phẩm
        </h2>
        <div className="w-16 h-1.5 bg-primary mt-6 rounded-full" />
      </div>
      
      <div className="relative">
        <div className={cn(
          "max-w-none transition-all duration-1000 ease-in-out",
          !isDescExpanded ? "max-h-[500px] overflow-hidden" : "max-h-none"
        )}>
          {/* 
            Sử dụng rich-text-content và kết hợp flex center để đảm bảo 
            toàn bộ nội dung từ Editor được căn giữa.
          */}
          <div 
            className="rich-text-content flex flex-col items-center text-center prose prose-lg prose-stone max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: description || "<p className='text-center italic'>Thông tin mô tả đang được cập nhật...</p>" }} 
          />
        </div>
        
        {/* Gradient Overlay when collapsed */}
        {!isDescExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/90 to-transparent z-10 flex items-end justify-center pb-4"></div>
        )}
        
        <div className={cn(
          "flex justify-center transition-all duration-500",
          !isDescExpanded ? "absolute bottom-8 left-0 right-0 z-20" : "mt-12"
        )}>
          <Button 
            onClick={() => {
              setIsDescExpanded(!isDescExpanded);
              if (isDescExpanded) {
                const el = document.getElementById('description');
                if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
              }
            }}
            className={cn(
              "btn-hero h-14 px-12 rounded-full font-bold shadow-gold group overflow-hidden relative transition-all active:scale-95",
              isDescExpanded ? "bg-charcoal text-white hover:bg-black" : "bg-primary text-white"
            )}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
              {isDescExpanded ? "Thu gọn nội dung" : "Xem Toàn Bộ Chi Tiết"}
              {isDescExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 animate-bounce" />}
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}