import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Maximize } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import heroBathroom from "@/assets/hero-bathroom.jpg";

const tabs = [
  "Tất Cả",
  "Phòng Khách",
  "Phòng Ngủ",
  "Phòng Ăn",
  "Văn Phòng",
  "Tối Giản",
  "Luxury",
];

const looks = [
  {
    id: 1,
    title: "Phòng Khách Sang Trọng Phong Cách Châu Âu",
    image: heroLivingRoom,
    category: "Phòng Khách",
    style: "Luxury",
    productsCount: 5,
    href: "/y-tuong/phong-khach-chau-au",
  },
  {
    id: 2,
    title: "Phòng Ăn Ấm Cúng Cho Gia Đình Hiện Đại",
    image: heroDiningRoom,
    category: "Phòng Ăn",
    style: "Hiện Đại",
    productsCount: 4,
    href: "/y-tuong/phong-an-am-cung",
  },
  {
    id: 3,
    title: "Không Gian Nghỉ Ngơi Tối Giản và Thanh Lịch",
    image: heroBedroom,
    category: "Phòng Ngủ",
    style: "Tối Giản",
    productsCount: 3,
    href: "/y-tuong/phong-ngu-toi-gian",
  },
  {
    id: 4,
    title: "Thiết Kế Phòng Tắm Cao Cấp Như Spa",
    image: heroBathroom,
    category: "Phòng Tắm",
    style: "Luxury",
    productsCount: 6,
    href: "/y-tuong/phong-tam-spa",
  },
];

export default function InspirationPage() {
  const [activeTab, setActiveTab] = useState("Tất Cả");

  const filteredLooks = activeTab === "Tất Cả" 
    ? looks 
    : looks.filter(look => look.category === activeTab || look.style === activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Cảm hứng thiết kế" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Cảm Hứng Thiết Kế</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Khám phá những ý tưởng nội thất độc đáo và tinh tế
              </p>
            </motion.div>
          </div>
        </section>

        {/* Lookbook Grid */}
        <section className="py-12 md:py-16">
          <div className="container-luxury">
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
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

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLooks.map((look, index) => (
                <motion.div
                  key={look.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  layout
                >
                  <Link to={look.href} className="group block card-luxury">
                    <div className="relative aspect-[4/3] img-zoom">
                      <img 
                        src={look.image} 
                        alt={look.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-card text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                          <Maximize className="w-4 h-4" />
                          Xem Chi Tiết
                        </span>
                      </div>
                      <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground px-3 py-1 rounded text-xs font-medium">
                        {look.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {look.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Phong cách: <span className="font-medium text-primary">{look.style}</span></span>
                        <span>{look.productsCount} sản phẩm</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-charcoal text-cream">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Cần Tư Vấn Thiết Kế Riêng?</h2>
            <p className="text-taupe mb-8 max-w-xl mx-auto">
              Đội ngũ kiến trúc sư của chúng tôi sẵn sàng biến ý tưởng của bạn thành hiện thực.
            </p>
            <Button className="btn-hero" asChild>
              <Link to="/thiet-ke">
                Yêu Cầu Thiết Kế
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}