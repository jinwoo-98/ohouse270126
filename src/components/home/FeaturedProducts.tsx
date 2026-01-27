import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

const featuredProducts = [
  {
    id: 1,
    name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá Sintered",
    image: categoryTvStand,
    price: 25990000,
    category: "Kệ Tivi",
    isNew: true,
    href: "/san-pham/ke-tivi-oc-cho-da",
  },
  {
    id: 2,
    name: "Sofa Góc Chữ L Phong Cách Ý",
    image: categorySofa,
    price: 45990000,
    category: "Sofa",
    isNew: false,
    href: "/san-pham/sofa-l-y",
  },
  {
    id: 3,
    name: "Bàn Ăn Mặt Đá Chân Inox Mạ Vàng",
    image: categoryDiningTable,
    price: 32990000,
    category: "Bàn Ăn",
    isNew: true,
    href: "/san-pham/ban-an-da-vang",
  },
  {
    id: 4,
    name: "Bàn Trà Tròn Mặt Đá Granite",
    image: categoryCoffeeTable,
    price: 12990000,
    category: "Bàn Trà",
    isNew: false,
    href: "/san-pham/ban-tra-granite",
  },
  {
    id: 5,
    name: "Bàn Làm Việc Gỗ Óc Chó Nguyên Khối",
    image: categoryDesk,
    price: 18990000,
    category: "Bàn Làm Việc",
    isNew: true,
    href: "/san-pham/ban-oc-cho",
  },
  {
    id: 6,
    name: "Giường Ngủ Bọc Da Ý Khung Inox",
    image: categoryBed,
    price: 38990000,
    category: "Giường",
    isNew: false,
    href: "/san-pham/giuong-da-y",
  },
  {
    id: 7,
    name: "Đèn Chùm Pha Lê Luxury",
    image: categoryLighting,
    price: 15990000,
    category: "Đèn Trang Trí",
    isNew: true,
    href: "/san-pham/den-pha-le",
  },
  {
    id: 8,
    name: "Bàn Trà Gỗ Sồi Phong Cách Bắc Âu",
    image: categoryCoffeeTable,
    price: 8990000,
    category: "Bàn Trà",
    isNew: false,
    href: "/san-pham/ban-tra-soi",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function FeaturedProducts() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container-luxury">
        {/* Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-2">Sản Phẩm Nổi Bật</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Những thiết kế được yêu thích nhất
          </p>
          <Button variant="outline" asChild className="mt-6">
            <Link to="/san-pham" className="group">
              Xem Tất Cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="group card-luxury">
                <Link to={`/san-pham/${product.id}`}>
                  <div className="relative aspect-square img-zoom">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isNew && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        Mới
                      </span>
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        className="p-3 bg-card rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label="Thêm vào yêu thích"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      <button
                        className="p-3 bg-card rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label="Thêm vào giỏ hàng"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </span>
                  <Link to={`/san-pham/${product.id}`}>
                    <h3 className="font-medium text-sm md:text-base line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-primary mt-2">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}