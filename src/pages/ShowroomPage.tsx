import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Mail, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroLivingRoom from "@/assets/hero-living-room.jpg";

const showrooms = [
  {
    id: 1,
    name: "Showroom Flagship TP.HCM",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    phone: "1900 888 999",
    hours: "8:00 - 21:00 (Tất cả các ngày)",
    mapLink: "#",
    image: heroLivingRoom,
  },
  {
    id: 2,
    name: "Showroom Hà Nội",
    address: "456 Phố Huế, Quận Hai Bà Trưng, Hà Nội",
    phone: "1900 888 999",
    hours: "9:00 - 20:00 (Thứ 2 - Thứ 7)",
    mapLink: "#",
    image: heroLivingRoom, // Placeholder image
  },
];

export default function ShowroomPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Showroom OHOUSE" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Hệ Thống Showroom</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Trải nghiệm không gian nội thất đẳng cấp tại các showroom của OHOUSE
              </p>
            </motion.div>
          </div>
        </section>

        {/* Showroom List */}
        <section className="py-16 md:py-24">
          <div className="container-luxury space-y-12">
            {showrooms.map((showroom, index) => (
              <motion.div
                key={showroom.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-8 bg-card rounded-lg shadow-elevated overflow-hidden"
              >
                <div className={`aspect-[4/3] lg:aspect-auto img-zoom ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <img 
                    src={showroom.image} 
                    alt={showroom.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">{showroom.name}</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-charcoal flex-shrink-0 mt-1" />
                      <p>{showroom.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-charcoal" />
                      <a href={`tel:${showroom.phone}`} className="hover:text-primary transition-colors">{showroom.phone}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-charcoal" />
                      <p>{showroom.hours}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-charcoal" />
                      <a href="mailto:info@ohouse.vn" className="hover:text-primary transition-colors">info@ohouse.vn</a>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-6 w-fit" asChild>
                    <a href={showroom.mapLink} target="_blank" rel="noopener noreferrer" className="group">
                      Xem Bản Đồ
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-secondary/50">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Đặt Lịch Tư Vấn Tại Showroom</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Để có trải nghiệm tốt nhất, vui lòng đặt lịch hẹn trước với chuyên viên tư vấn của chúng tôi.
            </p>
            <Button className="btn-hero" asChild>
              <Link to="/lien-he">
                Đặt Lịch Ngay
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