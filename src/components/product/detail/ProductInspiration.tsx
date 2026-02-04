import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductHorizontalScroll } from "../ProductHorizontalScroll"; // Import ProductHorizontalScroll
import { Button } from "@/components/ui/button";

interface ProductInspirationProps {
  product: any;
  comboProducts: any[];
  onQuickView: (product: any) => void; // Thêm prop onQuickView
}

export function ProductInspiration({ product, comboProducts, onQuickView }: ProductInspirationProps) {
  if (!comboProducts || comboProducts.length === 0) return null;

  return (
    <section className="mb-20">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> Perfect Match
        </span>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-charcoal">Bộ Sưu Tập Hoàn Hảo</h2>
      </div>

      <div className="bg-charcoal text-cream rounded-[32px] overflow-hidden shadow-elevated">
        <div className="grid md:grid-cols-2">
          {/* Main Inspirational Image */}
          <div className="relative aspect-square md:aspect-auto overflow-hidden group">
            <img 
              src={product.image_url} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Inspiration" 
            />
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Style Inspiration</p>
              <h3 className="text-2xl font-bold text-white leading-tight">Không gian sống đẳng cấp cùng {product.name}</h3>
            </div>
          </div>

          {/* Collection Items - Giữ nguyên danh sách dọc cho khối này */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <p className="text-taupe mb-8 leading-relaxed text-sm">
              Để tạo nên một tổng thể hài hòa và sang trọng, các nhà thiết kế của OHOUSE gợi ý bạn kết hợp sản phẩm này cùng các món đồ sau:
            </p>
            
            {/* Thay thế danh sách dọc bằng ProductHorizontalScroll */}
            <ProductHorizontalScroll 
              products={comboProducts} 
              title="" // Bỏ tiêu đề vì đã có mô tả
              onQuickView={onQuickView} 
            />
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <Button asChild variant="outline" className="w-full h-12 text-xs font-bold uppercase tracking-widest text-cream border-primary/40 hover:bg-primary hover:text-white">
                <Link to="/cam-hung">Khám phá thêm ý tưởng</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}