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
    <section className="mb-16 scroll-mt-24" id="description">
      <h2 className="text-xl font-bold uppercase tracking-widest text-charcoal mb-6 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-primary" /> Chi tiết sản phẩm
      </h2>
      <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
        <div className={cn(
          "prose prose-lg prose-stone max-w-none text-muted-foreground leading-relaxed relative overflow-hidden transition-all duration-500",
          !isDescExpanded && "max-h-[300px]"
        )}>
          <div dangerouslySetInnerHTML={{ __html: description || "Thông tin mô tả đang được cập nhật." }} />
          
          {!isDescExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4"></div>
          )}
        </div>
        
        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="rounded-full px-8 border-primary/30 text-primary hover:bg-primary/5"
          >
            {isDescExpanded ? (
              <>Thu gọn <ChevronUp className="w-4 h-4 ml-2" /></>
            ) : (
              <>Xem tất cả <ChevronDown className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}