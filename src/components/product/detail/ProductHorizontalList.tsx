import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface ProductHorizontalListProps {
  products: any[];
  title: string;
}

// Hàm format tiền tệ (nếu formatPrice từ lib/utils chưa sẵn sàng)
function localFormatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ProductHorizontalList({ products, title }: ProductHorizontalListProps) {
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-charcoal">{title}</h2>
        <div className="flex gap-2">
          {/* Có thể thêm nút điều hướng carousel ở đây */}
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
        {products.map(p => (
          <div key={p.id} className="min-w-[200px] md:min-w-[240px] snap-start">
            <Link to={`/san-pham/${p.id}`} className="group block card-luxury bg-white border border-border/50 h-full flex flex-col">
              <div className="aspect-[4/5] overflow-hidden bg-secondary/10 relative">
                <img 
                  src={p.image_url} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={p.name}
                />
                {p.is_sale && <span className="absolute top-2 left-2 bg-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-charcoal shadow-sm">Sale</span>}
                
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-white text-charcoal hover:bg-primary hover:text-white shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        image: p.image_url,
                        quantity: 1
                      });
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-xs md:text-sm text-charcoal line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">{p.name}</h3>
                <p className="text-primary font-bold text-sm">{localFormatPrice(p.price)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}