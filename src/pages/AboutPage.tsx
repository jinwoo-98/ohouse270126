import { motion } from "framer-motion";
import { Award, Users, Sparkles, HeartHandshake, MapPin, Phone, Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";

const stats = [
  { icon: Award, value: "10+", label: "Năm Kinh Nghiệm" },
  { icon: Users, value: "50K+", label: "Khách Hàng" },
  { icon: Sparkles, value: "5K+", label: "Sản Phẩm" },
  { icon: HeartHandshake, value: "100%", label: "Cam Kết" },
];

const team = [
  { name: "Nguyễn Văn A", role: "CEO & Founder", image: heroLivingRoom },
  { name: "Trần Thị B", role: "Design Director", image: heroDiningRoom },
  { name: "Lê Văn C", role: "Sales Manager", image: heroLivingRoom },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="About OHOUSE" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Về OHOUSE</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto px-4">
                Thương hiệu nội thất cao cấp hàng đầu Việt Nam
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Câu Chuyện Của Chúng Tôi</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    OHOUSE được thành lập với sứ mệnh mang đến những sản phẩm nội thất cao cấp, 
                    thiết kế sang trọng và chất lượng vượt trội cho người tiêu dùng Việt Nam.
                  </p>
                  <p>
                    Với hơn 10 năm kinh nghiệm trong ngành nội thất, chúng tôi tự hào là đối tác 
                    tin cậy của hàng nghìn gia đình và doanh nghiệp trên khắp cả nước.
                  </p>
                  <p>
                    Mỗi sản phẩm của OHOUSE đều được chọn lọc kỹ lưỡng từ các thương hiệu nội thất 
                    hàng đầu thế giới, đảm bảo chất lượng và tính thẩm mỹ cao nhất.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="aspect-[4/3] rounded-lg overflow-hidden"
              >
                <img src={heroDiningRoom} alt="OHOUSE Story" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-charcoal text-cream">
          <div className="container-luxury">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <p className="text-cream/70 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24">
          <div className="container-luxury">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Giá Trị Cốt Lõi</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Chất Lượng", desc: "Cam kết sản phẩm chất lượng cao từ các thương hiệu uy tín" },
                { title: "Thiết Kế", desc: "Đa dạng phong cách từ cổ điển đến hiện đại" },
                { title: "Dịch Vụ", desc: "Tư vấn chuyên nghiệp và hỗ trợ tận tâm" },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-card rounded-lg shadow-subtle"
                >
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-secondary/50">
          <div className="container-luxury">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Liên Hệ</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Địa Chỉ</h3>
                <p className="text-muted-foreground text-sm">123 Nguyễn Huệ, Q.1, TP.HCM</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Điện Thoại</h3>
                <p className="text-muted-foreground text-sm">1900 888 999</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground text-sm">info@ohouse.vn</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
