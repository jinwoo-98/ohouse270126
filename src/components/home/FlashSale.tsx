import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

const flashSaleProducts = [
  {
    id: 1,
    name: "Kệ Tivi Gỗ Óc Chó Phong Cách Nhật",
    image: categoryTvStand,
    originalPrice: 25990000,
    salePrice: 19990000,
    href: "/san-pham/ke-tivi-oc-cho",
  },
  {
    id: 2,
    name: "Sofa Góc Chữ L Vải Nhung Cao Cấp",
    image: categorySofa,
    originalPrice: 45990000,
    salePrice: 35990000,
    href: "/san-pham/sofa-goc-l",
  },
  {
    id: 3,
    name: "Bàn Ăn Mặt Đá Sintered Stone",
    image: categoryDiningTable,
    originalPrice: 32990000,
    salePrice: 26990000,
    href: "/san-pham/ban-an-da",
  },
  {
    id: 4,
    name: "Giường Ngủ Bọc Da Cao Cấp",
    image: categoryBed,
    originalPrice: 38990000,
    salePrice: 29990000,
    href: "/san-pham/giuong-boc-da",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 29,
    seconds: 53,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset countdown
          return { hours: 4, minutes: 29, seconds: 53 };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2">
      <Clock className="w-5 h-5 text-destructive" />
      <span className="text-muted-foreground mr-2">Kết thúc sau</span>
      <div className="flex items-center gap-1">
        <span className="bg-charcoal text-cream px-2 py-1 rounded font-mono text-lg font-bold min-w-[2.5rem] text-center">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-charcoal font-bold">:</span>
        <span className="bg-charcoal text-cream px-2 py-1 rounded font-mono text-lg font-bold min-w-[2.5rem] text-center">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-charcoal font-bold">:</span>
        <span className="bg-charcoal text-cream px-2 py-1 rounded font-mono text-lg font-bold min-w-[2.5rem] text-center">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export function FlashSale() {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-luxury">
        {/* Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">Flash Sale</h2>
          <CountdownTimer />
          <Button variant="outline" asChild className="mt-6">
            <Link to="/flash-sale" className="group">
              Xem Tất Cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {flashSaleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={product.href} className="group block card-luxury">
                <div className="relative aspect-square img-zoom">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 badge-sale">
                    Flash Sale
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors mb-3">
                    {product.name}
                  </h3>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}