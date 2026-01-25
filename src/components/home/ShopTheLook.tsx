import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";

const tabs = [
  "Tất Cả",
  "Phòng Khách",
  "Phòng Ngủ",
  "Phòng Ăn",
  "Văn Phòng",
];

const looks = [
  {
    id: 1,
    title: "Phòng Khách Sang Trọng Phong Cách Châu Âu",
    image: heroLivingRoom,
    category: "Phòng Khách",
    products: [
      { name: "Sofa", price: "45.990.000₫" },
      { name: "Bàn Trà", price: "12.990.000₫" },
      { name: "Kệ Tivi", price: "19.990.000₫" },
    ],
    href: "/y-tuong/phong-khach-chau-au",
  },
  {
    id: 2,
    title: "Phòng Ăn Ấm Cúng Cho Gia Đình",
    image: heroDiningRoom,
    category: "Phòng Ăn",
    products: [
      { name: "Bàn Ăn", price: "26.990.000₫" },
      { name: "Ghế Ăn", price: "4.990.000₫" },
      { name: "Tủ Rượu", price: "18.990.000₫" },
    ],
    href: "/y-tuong/phong-an-am-cung",
  },
];

export function ShopTheLook() {
  const [activeTab, setActiveTab] = useState("Tất Cả");

  return (
    <section className="py-16 md:py-24">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title text-left">Ý Tưởng Thiết Kế</h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" asChild>
              <Link to="/y-tuong" className="group">
                Xem Tất Cả
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-charcoal text-cream"
                  : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Looks Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {looks.map((look, index) => (
            <motion.div
              key={look.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={look.href} className="group block card-luxury">
                <div className="relative aspect-[16/10] img-zoom">
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                  
                  {/* Products List */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {look.products.map((product) => (
                        <span
                          key={product.name}
                          className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs"
                        >
                          {product.name}: <span className="font-semibold">{product.price}</span>
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-cream group-hover:text-primary transition-colors">
                      {look.title}
                    </h3>
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
