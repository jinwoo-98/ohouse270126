import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Send, Bot, ExternalLink, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
      });

      if (error) throw error;
      toast.success("Cảm ơn bạn! OHOUSE đã nhận được tin nhắn và sẽ phản hồi sớm nhất.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-secondary/50 py-3 border-b border-border/40">
          <div className="container-luxury flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Liên hệ</span>
          </div>
        </div>

        <section className="bg-charcoal text-cream py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>
          
          <div className="container-luxury text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Hỗ trợ khách hàng</span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Liên Hệ Với OHOUSE</h1>
              <p className="text-taupe max-w-2xl mx-auto text-lg leading-relaxed">
                Đội ngũ chuyên viên tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn kiến tạo không gian sống trong mơ.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Contact Grid */}
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

        {/* Traditional Contact Form Section */}
        <section className="py-20 bg-secondary/20">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-bold mb-6">Để Lại Lời Nhắn</h2>
                <p className="text-muted-foreground mb-10 leading-relaxed">
                  Bạn có yêu cầu đặc biệt hoặc cần tư vấn sâu về thiết kế trọn gói? Hãy để lại thông tin, chuyên viên của OHOUSE sẽ liên hệ lại ngay.
                </p>
                
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-charcoal text-cream rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Showroom Flagship</h4>
                      <p className="text-sm text-muted-foreground">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-charcoal text-cream rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Hotline CSKH</h4>
                      <p className="text-sm text-muted-foreground">1900 888 999 (8h00 - 21h00)</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-charcoal text-cream rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Email Hỗ Trợ</h4>
                      <p className="text-sm text-muted-foreground">info@ohouse.vn</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
                className="bg-card p-8 md:p-10 rounded-3xl shadow-elevated border border-border/40"
              >
                <form onSubmit={handleMessageSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Họ và tên</Label>
                      <Input name="name" placeholder="Ví dụ: Nguyễn Văn A" required className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Số điện thoại</Label>
                      <Input name="phone" placeholder="0909xxxxxx" required className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Địa chỉ Email</Label>
                    <Input name="email" type="email" placeholder="example@email.com" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chủ đề cần hỗ trợ</Label>
                    <Input name="subject" placeholder="Ví dụ: Bảo hành sản phẩm, Tư vấn thiết kế..." required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nội dung tin nhắn</Label>
                    <Textarea name="message" placeholder="Mô tả chi tiết yêu cầu của bạn..." rows={4} required className="rounded-xl resize-none" />
                  </div>
                  <Button type="submit" className="w-full btn-hero h-14 text-sm font-bold shadow-gold" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    Gửi Tin Nhắn Ngay
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <AIChatWindow isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <Footer />
    </div>
  );
}