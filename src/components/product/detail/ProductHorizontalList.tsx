import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface ProductHorizontalListProps {
  products: any[];
  title: string;
}

function localFormatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ProductHorizontalList({ products, title }: ProductHorizontalListProps) {
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Khám phá thêm</span>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-charcoal">{title}</h2>
        <div className="w-10 h-0.5 bg-primary mt-4 rounded-full" />
      </div>
      
      <div className="flex gap-4 md:gap-8 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory">
        {products.map(p => (
          <div key={p.id} className="min-w-[200px] md:min-w-[280px] snap-start">
            <div className="group block h-full flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20 rounded-2xl border border-border/40">
                <Link to={`/san-pham/${p.id}`} className="block h-full">
                  <img 
                    src={p.image_url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={p.name}
                  />
                </Link>
                {p.is_sale && (
                  <span className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-charcoal shadow-sm">
                    Sale
                  </span>
                )}
                
                <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <Button 
                    className="w-full btn-hero h-11 text-[10px] shadow-gold rounded-xl"
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
                    <ShoppingBag className="w-3.5 h-3.5 mr-2" /> THÊM VÀO GIỎ
                  </Button>
                </div>
              </div>
              <div className="pt-5 flex-1 flex flex-col text-center">
                <Link to={`/san-pham/${p.id}`}>
                  <h3 className="font-bold text-xs md:text-sm text-charcoal line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">{p.name}</h3>
                </Link>
                <p className="text-primary font-bold text-base">{localFormatPrice(p.price)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}