import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  return (
    <section className="mb-20 scroll-mt-24" id="description">
      <div className="flex flex-col items-center mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Thông tin chi tiết</span>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-charcoal text-center">
          Khám Phá Sản Phẩm
        </h2>
        <div className="w-12 h-1 bg-primary mt-4 rounded-full" />
      </div>
      
      <div className="relative">
        <div className={cn(
          "prose prose-lg prose-stone max-w-none text-muted-foreground leading-relaxed transition-all duration-700",
          !isDescExpanded ? "max-h-[600px] overflow-hidden" : "max-h-none"
        )}>
          <div 
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: description || "<p className='text-center italic'>Thông tin mô tả đang được cập nhật...</p>" }} 
          />
          
          {!isDescExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-4"></div>
          )}
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="group flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal hover:text-primary transition-colors"
          >
            <span>{isDescExpanded ? "Thu gọn thông tin" : "Xem toàn bộ chi tiết"}</span>
            <div className="w-8 h-8 rounded-full border border-charcoal/20 flex items-center justify-center group-hover:border-primary transition-colors">
              {isDescExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 animate-bounce" />}
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}