import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ChevronRight, Heart, TrendingUp, Users, Coffee } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";

const benefits = [
  { icon: TrendingUp, title: "Phát Triển Sự Nghiệp", desc: "Cơ hội thăng tiến rõ ràng" },
  { icon: Heart, title: "Bảo Hiểm Đầy Đủ", desc: "BHXH, BHYT, BHTN theo luật" },
  { icon: Coffee, title: "Môi Trường Năng Động", desc: "Văn phòng hiện đại, trẻ trung" },
  { icon: Users, title: "Team Building", desc: "Du lịch, sự kiện định kỳ" },
];

const jobs = [
  {
    id: 1,
    title: "Nhân Viên Kinh Doanh",
    department: "Kinh Doanh",
    location: "TP. Hồ Chí Minh",
    type: "Toàn thời gian",
    salary: "15 - 25 triệu",
  },
  {
    id: 2,
    title: "Nhân Viên Thiết Kế Nội Thất",
    department: "Thiết Kế",
    location: "Hà Nội",
    type: "Toàn thời gian",
    salary: "12 - 20 triệu",
  },
  {
    id: 3,
    title: "Chuyên Viên Marketing",
    department: "Marketing",
    location: "TP. Hồ Chí Minh",
    type: "Toàn thời gian",
    salary: "10 - 18 triệu",
  },
  {
    id: 4,
    title: "Nhân Viên Chăm Sóc Khách Hàng",
    department: "CSKH",
    location: "TP. Hồ Chí Minh",
    type: "Toàn thời gian",
    salary: "8 - 12 triệu",
  },
  {
    id: 5,
    title: "Quản Lý Showroom",
    department: "Vận Hành",
    location: "Đà Nẵng",
    type: "Toàn thời gian",
    salary: "20 - 30 triệu",
  },
];

export default function RecruitmentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Tuyển dụng OHOUSE" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Gia Nhập OHOUSE</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Cùng nhau kiến tạo không gian sống đẳng cấp
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-secondary/50">
          <div className="container-luxury">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Quyền Lợi Nhân Viên</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-card rounded-lg shadow-subtle"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-16">
          <div className="container-luxury">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Vị Trí Đang Tuyển</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Chúng tôi đang tìm kiếm những ứng viên tài năng và nhiệt huyết
            </p>

            <div className="space-y-4 max-w-4xl mx-auto">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 shadow-subtle hover:shadow-medium transition-shadow group cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                          {job.department}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="flex-shrink-0">
                      Ứng Tuyển
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-charcoal text-cream">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Không Tìm Thấy Vị Trí Phù Hợp?</h2>
            <p className="text-taupe mb-8 max-w-xl mx-auto">
              Gửi CV của bạn về cho chúng tôi, chúng tôi sẽ liên hệ khi có vị trí phù hợp
            </p>
            <Button className="btn-hero">
              Gửi CV Ngay
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
