import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
}

export function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("ohouse_recent_views");
    if (saved) {
      setProducts(JSON.parse(saved).slice(0, 4));
    }
  }, [location.pathname]);

  if (products.length === 0) return null;

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  return (
    <section className="py-12 border-t">
      <div className="container-luxury">
        <h2 className="text-xl font-bold mb-8">Sản phẩm bạn vừa xem</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/san-pham/${product.id}`} className="group">
              <div className="bg-card rounded-lg overflow-hidden border border-border/50 transition-shadow hover:shadow-subtle">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function trackProductView(product: Product) {
  const saved = localStorage.getItem("ohouse_recent_views");
  let recent: Product[] = saved ? JSON.parse(saved) : [];
  
  // Xóa nếu đã tồn tại để đẩy lên đầu
  recent = recent.filter(p => p.id !== product.id);
  recent.unshift(product);
  
  // Lưu tối đa 10 sản phẩm
  localStorage.setItem("ohouse_recent_views", JSON.stringify(recent.slice(0, 10)));
}