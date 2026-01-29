import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductInspirationProps {
  product: any;
  comboProducts: any[];
}

export function ProductInspiration({ product, comboProducts }: ProductInspirationProps) {
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
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent md:bg-black/20 transition-colors" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Style Inspiration</p>
              <h3 className="text-2xl font-bold text-white leading-tight">Không gian sống đẳng cấp cùng {product.name}</h3>
            </div>
          </div>

          {/* Collection Items */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <p className="text-taupe mb-8 leading-relaxed text-sm">
              Để tạo nên một tổng thể hài hòa và sang trọng, các nhà thiết kế của OHOUSE gợi ý bạn kết hợp sản phẩm này cùng các món đồ sau:
            </p>
            
            <div className="space-y-4">
              {comboProducts.map((p, idx) => (
                <Link 
                  key={p.id} 
                  to={`/san-pham/${p.slug || p.id}`}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white">
                    <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-cream truncate group-hover:text-primary transition-colors">{p.name}</h4>
                    <p className="text-[10px] text-taupe mt-1 uppercase tracking-wider">{p.category_id}</p>
                    <p className="text-primary font-bold text-sm mt-1">{formatPrice(p.price)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}