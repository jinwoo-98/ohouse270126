import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Maximize2, Calendar, Layout, User } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";

const PROJECT_DATA = {
  title: "Penthouse The Marq - Quận 1",
  category: "Căn Hộ",
  location: "TP. Hồ Chí Minh",
  area: "250m²",
  style: "Luxury Modern",
  year: "2023",
  client: "Mr. Quang",
  description: "Dự án Penthouse tại The Marq được thiết kế theo phong cách Luxury Modern, tập trung vào việc sử dụng các vật liệu cao cấp như gỗ óc chó, đá Marble tự nhiên và các chi tiết kim loại mạ vàng để tạo nên một không gian sống đẳng cấp bậc nhất.",
  images: [heroLivingRoom, heroDiningRoom, heroBedroom, heroLivingRoom]
};

export default function ProjectDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-charcoal text-cream py-16">
          <div className="container-luxury">
            <Link to="/du-an" className="inline-flex items-center text-sm text-taupe hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tất cả dự án
            </Link>
            <div className="grid lg:grid-cols-2 gap-12 items-end">
              <div>
                <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">{PROJECT_DATA.category}</span>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">{PROJECT_DATA.title}</h1>
                <p className="text-taupe leading-relaxed text-lg max-w-xl">{PROJECT_DATA.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-walnut/20 p-6 rounded-xl border border-walnut/30">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-taupe font-bold tracking-widest">Diện tích</p>
                  <p className="font-bold">{PROJECT_DATA.area}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-taupe font-bold tracking-widest">Phong cách</p>
                  <p className="font-bold">{PROJECT_DATA.style}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-taupe font-bold tracking-widest">Vị trí</p>
                  <p className="font-bold">{PROJECT_DATA.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-taupe font-bold tracking-widest">Năm</p>
                  <p className="font-bold">{PROJECT_DATA.year}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-luxury">
            <div className="columns-1 md:columns-2 gap-8 space-y-8">
              {PROJECT_DATA.images.map((img, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative group rounded-xl overflow-hidden"
                >
                  <img src={img} alt="" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" className="bg-card/80 backdrop-blur-sm"><Maximize2 className="w-4 h-4 mr-2" /> Xem ảnh</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Bạn yêu thích phong cách này?</h2>
            <Button className="btn-hero" asChild>
              <Link to="/thiet-ke">Nhận tư vấn thiết kế tương tự</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}