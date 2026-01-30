import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import heroBathroom from "@/assets/hero-bathroom.jpg";
import { InspirationLookCard } from "@/components/inspiration/InspirationLookCard";

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

            {/* Grid: Changed to grid-cols-4 on large screens to accommodate col-span-2 for double width */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredLooks.map((look, index) => (
                <InspirationLookCard key={look.id} look={look} index={index} />
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