import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductInspirationProps {
  product: any;
  comboProducts: any[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ProductInspiration({ product, comboProducts }: ProductInspirationProps) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-center mb-10">Gợi Ý Phối Cảnh Hoàn Hảo</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center bg-charcoal text-cream rounded-3xl overflow-hidden shadow-elevated">
        <div className="aspect-video md:aspect-square relative overflow-hidden group">
          <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Inspiration" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="p-8 md:p-12 text-center md:text-left">
          <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Bộ Sưu Tập</span>
          <h3 className="text-2xl md:text-4xl font-bold mb-6">Không gian sống đẳng cấp</h3>
          <p className="text-taupe mb-8 leading-relaxed">
            Sản phẩm này là mảnh ghép hoàn hảo cho phong cách nội thất hiện đại. Kết hợp cùng các món đồ decor tinh tế để tạo nên không gian sống đậm chất nghệ thuật.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {comboProducts.map(p => (
              <Link key={p.id} to={`/san-pham/${p.id}`} className="group bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3 text-left">
                <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-cream truncate group-hover:text-primary transition-colors">{p.name}</p>
                  <p className="text-[10px] text-taupe">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}