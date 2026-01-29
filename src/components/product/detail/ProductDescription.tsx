import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  return (
    <section className="mb-20 scroll-mt-24" id="description">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-primary rounded-full" />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-charcoal">
          Chi tiết sản phẩm
        </h2>
      </div>
      
      <div className="relative">
        <div className={cn(
          "prose prose-lg prose-stone max-w-none text-muted-foreground leading-relaxed transition-all duration-700",
          !isDescExpanded ? "max-h-[500px] overflow-hidden" : "max-h-none"
        )}>
          {/* Xóa viền bao quanh nội dung để tạo cảm giác tràn viền rộng rãi */}
          <div 
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: description || "<p>Thông tin mô tả đang được cập nhật...</p>" }} 
          />
          
          {!isDescExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-4"></div>
          )}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="rounded-full px-10 h-12 border-primary/30 text-primary hover:bg-primary hover:text-white font-bold transition-all shadow-sm"
          >
            {isDescExpanded ? (
              <>THU GỌN THÔNG TIN <ChevronUp className="w-4 h-4 ml-2" /></>
            ) : (
              <>XEM CHI TIẾT SẢN PHẨM <ChevronDown className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}