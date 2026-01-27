import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";

const looks = [
  {
    id: 1,
    title: "Phòng Khách Sang Trọng Phong Cách Châu Âu",
    image: heroLivingRoom,
    category: "Phòng Khách",
    products: [
      { id: 2, name: "Sofa Góc Chữ L", href: "/san-pham/2", position: { top: "65%", left: "40%" } },
      { id: 4, name: "Bàn Trà Tròn", href: "/san-pham/4", position: { top: "78%", left: "65%" } },
      { id: 7, name: "Đèn Sàn Trang Trí", href: "/san-pham/12", position: { top: "50%", left: "85%" } },
    ],
    href: "/y-tuong/phong-khach-chau-au",
  },
  {
    id: 2,
    title: "Phòng Ăn Ấm Cúng Cho Gia Đình Hiện Đại",
    image: heroDiningRoom,
    category: "Phòng Ăn",
    products: [
      { id: 3, name: "Bàn Ăn Mặt Đá", href: "/san-pham/3", position: { top: "60%", left: "50%" } },
      { id: 10, name: "Ghế Ăn Bọc Da", href: "/san-pham/10", position: { top: "55%", left: "25%" } },
      { id: 7, name: "Đèn Chùm Pha Lê", href: "/san-pham/7", position: { top: "20%", left: "50%" } },
    ],
    href: "/y-tuong/phong-an-am-cung",
  },
  {
    id: 3,
    title: "Không Gian Nghỉ Ngơi Tối Giản và Thanh Lịch",
    image: heroBedroom,
    category: "Phòng Ngủ",
    products: [
      { id: 6, name: "Giường Ngủ Bọc Da", href: "/san-pham/6", position: { top: "60%", left: "50%" } },
      { id: 14, name: "Tủ Quần Áo Gỗ Sồi", href: "/san-pham/14", position: { top: "45%", left: "85%" } },
    ],
    href: "/y-tuong/phong-ngu-toi-gian",
  },
];

export function ShopTheLook() {
  const [currentLook, setCurrentLook] = useState(0);

  const nextLook = () => {
    setCurrentLook((prev) => (prev + 1) % looks.length);
  };

  const prevLook = () => {
    setCurrentLook((prev) => (prev - 1 + looks.length) % looks.length);
  };

  const activeLook = looks[currentLook];

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
          <h2 className="section-title mb-4">Ý Tưởng Thiết Kế</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Khám phá các không gian được sắp đặt tinh tế và mua sắm trọn bộ sản phẩm.
          </p>
          <Button variant="outline" asChild>
            <Link to="/cam-hung" className="group">
              Xem Tất Cả Ý Tưởng
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLook}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-secondary">
                <img
                  src={activeLook.image}
                  alt={activeLook.title}
                  className="w-full h-full object-cover"
                />
                {activeLook.products.map((product) => (
                  <Link
                    key={product.id}
                    to={product.href}
                    className="group absolute z-10"
                    style={{ top: product.position.top, left: product.position.left }}
                  >
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <div className="absolute w-3 h-3 rounded-full bg-primary transition-transform group-hover:scale-125" />
                      <div className="absolute w-full h-full rounded-full bg-primary/50 animate-ping" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-2 px-3 bg-card text-foreground text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {product.name}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-4">
                <h3 className="text-lg font-semibold">{activeLook.title}</h3>
                <p className="text-sm text-muted-foreground">{activeLook.category}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevLook}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 p-2.5 bg-card/50 backdrop-blur-sm rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-medium"
            aria-label="Previous look"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextLook}
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 p-2.5 bg-card/50 backdrop-blur-sm rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-medium"
            aria-label="Next look"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}