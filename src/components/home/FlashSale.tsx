import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

const flashSaleProducts = [
  { id: 1, name: "Kệ Tivi Gỗ Óc Chó Phong Cách Nhật", image: categoryTvStand, originalPrice: 25990000, salePrice: 19990000, href: "/san-pham/1" },
  { id: 2, name: "Sofa Góc Chữ L Vải Nhung Cao Cấp", image: categorySofa, originalPrice: 45990000, salePrice: 35990000, href: "/san-pham/2" },
  { id: 3, name: "Bàn Ăn Mặt Đá Sintered Stone", image: categoryDiningTable, originalPrice: 32990000, salePrice: 26990000, href: "/san-pham/3" },
  { id: 4, name: "Giường Ngủ Bọc Da Cao Cấp", image: categoryBed, originalPrice: 38990000, salePrice: 29990000, href: "/san-pham/6" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function FlashSale() {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 29, seconds: 53 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-10 md:py-24 bg-cream">
      <div className="container-luxury">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
          <h2 className="section-title mb-2 md:mb-4">Flash Sale</h2>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
            <span className="text-sm md:text-base text-muted-foreground mr-1 md:mr-2">Kết thúc sau</span>
            <div className="flex items-center gap-1 font-mono text-base md:text-lg font-bold">
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}</span>:
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}</span>:
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {flashSaleProducts.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group card-luxury">
              <div className="relative aspect-square img-zoom">
                <Link to={product.href}><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></Link>
                {/* Mobile: Always visible add button, Desktop: Hover */}
                <div className="absolute inset-0 bg-charcoal/0 lg:group-hover:bg-charcoal/20 transition-all flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100">
                  <Button 
                    size="sm" 
                    className="shadow-lg opacity-100 lg:opacity-100" // Always visible on mobile if needed, or customize logic
                    onClick={() => addToCart({ id: product.id, name: product.name, price: product.salePrice, image: product.image, quantity: 1 })}
                  >
                    <ShoppingBag className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Thêm nhanh</span>
                  </Button>
                </div>
              </div>
              <div className="p-3 md:p-4">
                <Link to={product.href}><h3 className="font-medium text-xs md:text-sm line-clamp-2 mb-2 md:mb-3">{product.name}</h3></Link>
                <div className="flex flex-col">
                  <span className="text-base md:text-lg font-bold text-primary">{formatPrice(product.salePrice)}</span>
                  <span className="text-xs md:text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}