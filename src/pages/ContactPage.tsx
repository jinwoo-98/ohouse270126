import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Send, Bot, ExternalLink, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AIChatWindow } from "@/components/contact/AIChatWindow";

const contactChannels = [
  {
    id: 'ai',
    icon: Bot,
    title: "Chat với AI",
    desc: "Tư vấn sản phẩm & giải đáp nhanh 24/7",
    action: "Bắt đầu chat",
    color: "bg-primary/10 text-primary",
    isInternal: true
  },
  {
    id: 'zalo',
    icon: MessageCircle,
    title: "Nhắn Zalo",
    desc: "Hỗ trợ kỹ thuật & xem ảnh thực tế",
    action: "0909 123 456",
    color: "bg-blue-500/10 text-blue-600",
    href: "https://zalo.me/123456789"
  },
  {
    id: 'phone',
    icon: Phone,
    title: "Gọi Hotline",
    desc: "Đặt hàng & khiếu nại dịch vụ",
    action: "1900 888 999",
    color: "bg-green-500/10 text-green-600",
    href: "tel:1900888999"
  },
  {
    id: 'fb',
    icon: Facebook,
    title: "Facebook Messenger",
    desc: "Cập nhật xu hướng & khuyến mãi",
    action: "Nhắn Fanpage",
    color: "bg-indigo-500/10 text-indigo-600",
    href: "https://m.me/ohouse.vn"
  },
  {
    id: 'email',
    icon: Mail,
    title: "Gửi Email",
    desc: "Hỗ trợ bảo hành & thông tin hóa đơn",
    action: "info@ohouse.vn",
    color: "bg-orange-500/10 text-orange-600",
    href: "mailto:info@ohouse.vn"
  }
];

export default function ContactPage() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-charcoal text-cream py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>
          
          <div className="container-luxury text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Chúng tôi ở đây để giúp bạn</span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Liên Hệ Với OHOUSE</h1>
              <p className="text-taupe max-w-2xl mx-auto text-lg">
                Chọn phương thức thuận tiện nhất cho bạn. Đội ngũ chúng tôi luôn sẵn sàng hỗ trợ mọi thắc mắc.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-luxury">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {contactChannels.map((channel, index) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="card-luxury p-8 h-full flex flex-col border border-border/50 bg-card hover:border-primary/30 transition-all group">
                    <div className={`w-14 h-14 ${channel.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <channel.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{channel.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                      {channel.desc}
                    </p>
                    
                    <div className="mt-auto">
                      {channel.isInternal ? (
                        <Button 
                          onClick={() => setIsAIChatOpen(true)}
                          className="w-full btn-hero h-12 text-xs font-bold shadow-gold"
                        >
                          {channel.action} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full h-12 text-xs font-bold border-charcoal/20 hover:bg-charcoal hover:text-cream"
                          asChild
                        >
                          <a href={channel.href} target="_blank" rel="noopener noreferrer">
                            {channel.action} <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/30">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-bold mb-6">Ghé Thăm Showroom</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Trải nghiệm tận mắt các sản phẩm nội thất cao cấp tại không gian trưng bày sang trọng của OHOUSE.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-charcoal text-cream rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Showroom TP.HCM</h4>
                      <p className="text-sm text-muted-foreground">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-charcoal text-cream rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Showroom Hà Nội</h4>
                      <p className="text-sm text-muted-foreground">456 Phố Huế, Quận Hai Bà Trưng, Hà Nội</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="aspect-video bg-muted rounded-3xl overflow-hidden shadow-medium border border-border/50 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-bold text-sm uppercase tracking-widest">Bản đồ vị trí Showroom</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <Footer />
    </div>
  );
}