"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, generateProductAltText } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface ProductDescriptionProps {
  description: string;
  product?: any; 
}

export function ProductDescription({ description, product }: ProductDescriptionProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Logic xử lý Alt ảnh tự động cho nội dung bài viết và sanitize HTML
  const processedContent = useMemo(() => {
    if (!description) return "";

    // 1. Sanitize content first
    const sanitized = sanitizeHtml(description);

    // 2. Process images for SEO
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    const images = doc.querySelectorAll('img');

    images.forEach((img, index) => {
      const newAlt = generateProductAltText(product, index);
      img.setAttribute('alt', newAlt);
    });

    return doc.body.innerHTML;
  }, [description, product]);

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
            QUAN TRỌNG: Loại bỏ lớp 'prose' vì nó gây ra lỗi hyphens (ngắt từ).
            Sử dụng các lớp text cơ bản giống như phần Đánh giá.
          */}
          <div 
            className="vn-text-final-fix w-full max-w-[800px] mx-auto text-sm md:text-base text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedContent || "<p class='text-center italic'>Thông tin mô tả đang được cập nhật...</p>" }} 
          />
        </div>
        
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
              "btn-hero h-14 px-12 rounded-2xl font-bold shadow-gold group overflow-hidden relative transition-all active:scale-95",
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

      <style>{`
        .vn-text-final-fix img {
          width: 100% !important;
          max-width: 800px !important;
          height: auto !important;
          object-fit: cover !important;
          border-radius: 16px;
          margin: 2rem auto !important;
          display: block;
        }
        .vn-text-final-fix p {
          margin-bottom: 1.5rem !important;
        }
        .vn-text-final-fix h1, .vn-text-final-fix h2, .vn-text-final-fix h3 {
          color: #1a1a1a;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .vn-text-final-fix h1 { font-size: 1.5rem; }
        .vn-text-final-fix h2 { font-size: 1.25rem; }
        .vn-text-final-fix h3 { font-size: 1.1rem; }
        
        .vn-text-final-fix ul, .vn-text-final-fix ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .vn-text-final-fix ul { list-style-type: disc; }
        .vn-text-final-fix ol { list-style-type: decimal; }
        .vn-text-final-fix li { margin-bottom: 0.5rem; }
      `}</style>
    </section>
  );
}