import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

const looks = [
  {
    id: 1,
    title: "Không Gian Sống Hiện Đại",
    mainImage: heroLivingRoom,
    thumbnailImage: heroLivingRoom,
    products: [
      { id: 2, name: "Sofa Góc Chữ L Vải Nhung", image: categorySofa, price: 45990000, href: "/san-pham/2" },
      { id: 4, name: "Bàn Trà Tròn Mặt Kính", image: categoryCoffeeTable, price: 12990000, href: "/san-pham/4" },
      { id: 12, name: "Đèn Sàn Trang Trí", image: categoryDiningTable, price: 6990000, href: "/san-pham/12" },
    ],
  },
  {
    id: 2,
    title: "Phòng Ăn Sang Trọng",
    mainImage: heroDiningRoom,
    thumbnailImage: heroDiningRoom,
    products: [
      { id: 3, name: "Bàn Ăn Mặt Đá Marble", image: categoryDiningTable, price: 32990000, originalPrice: 38990000, href: "/san-pham/3" },
      { id: 10, name: "Ghế Ăn Bọc Da", image: categorySofa, price: 42990000, href: "/san-pham/10" },
      { id: 7, name: "Đèn Chùm Pha Lê", image: categoryBed, price: 15990000, href: "/san-pham/7" },
    ],
  },
  {
    id: 3,
    title: "Phòng Ngủ Tối Giản",
    mainImage: heroBedroom,
    thumbnailImage: heroBedroom,
    products: [
      { id: 6, name: "Giường Ngủ Bọc Da Ý", image: categoryBed, price: 38990000, href: "/san-pham/6" },
      { id: 14, name: "Tủ Quần Áo Gỗ Sồi", image: categorySofa, price: 22000000, href: "/san-pham/14" },
    ],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ShopTheLook() {
  const [activeLookId, setActiveLookId] = useState(1);
  const activeLook = looks.find(look => look.id === activeLookId)!;

  return (
    <section className="py-16 md:py-24">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">Shop The Look</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lấy cảm hứng từ những không gian được tuyển chọn và mua sắm trọn bộ.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Image */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLook.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="aspect-[4/3] rounded-lg overflow-hidden"
              >
                <img
                  src={activeLook.mainImage}
                  alt={activeLook.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">{activeLook.title}</h3>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3">
              <AnimatePresence mode="wait">
                {activeLook.products.map((product, index) => (
                  <motion.div
                    key={`${activeLook.id}-${product.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex gap-4 p-3 bg-secondary/30 rounded-lg">
                      <Link to={product.href} className="flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
                      </Link>
                      <div className="flex-1">
                        <Link to={product.href}>
                          <h4 className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                          )}
                        </div>
                        <Button size="sm" className="mt-2 h-8 px-3 text-xs">
                          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="mt-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {looks.map((look) => (
              <button
                key={look.id}
                onClick={() => setActiveLookId(look.id)}
                className={`aspect-[4/3] rounded-md overflow-hidden border-2 transition-all duration-300 ${
                  activeLookId === look.id ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={look.thumbnailImage} alt={look.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}