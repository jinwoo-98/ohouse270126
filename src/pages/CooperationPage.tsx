import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, MessageSquare, Briefcase, Phone, Mail, CheckCircle2, Loader2, Send, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const partnerTypes = [
  { icon: Building2, title: "Đại Lý Phân Phối", desc: "Trở thành đối tác phân phối sản phẩm OHOUSE với chính sách chiết khấu hấp dẫn." },
  { icon: Briefcase, title: "Dự Án Nhà Thầu", desc: "Hợp tác cung ứng nội thất cho các công trình căn hộ, khách sạn, văn phòng quy mô lớn." },
  { icon: Users, title: "Kiến Trúc Sư", desc: "Chương trình cộng tác dành cho KTS và nhà thiết kế nội thất với thư viện 3D phong phú." },
];

export default function CooperationPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Yêu cầu hợp tác đã được gửi! Bộ phận B2B của chúng tôi sẽ liên hệ trong vòng 24h.");
    }, 1500);
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
            <span className="text-foreground">Hợp tác kinh doanh</span>
          </div>
        </div>

        <section className="bg-charcoal text-cream py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,hsl(var(--primary))_0%,transparent_70%)]" />
          </div>
          
          <div className="container-luxury text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">B2B & Partnerships</span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Hợp Tác Cùng OHOUSE</h1>
              <p className="text-taupe max-w-2xl mx-auto text-lg leading-relaxed">
                Cùng nhau kiến tạo những không gian sống đẳng cấp và phát triển bền vững trong ngành nội thất cao cấp.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container-luxury">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Các Hình Thức Hợp Tác</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {partnerTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card p-8 rounded-3xl border border-border/50 shadow-subtle hover:shadow-medium transition-all text-center group"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <type.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{type.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {type.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/30">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-2 gap-16">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-bold mb-8">Tại Sao Nên Hợp Tác Với OHOUSE?</h2>
                <div className="space-y-6">
                  {[
                    { t: "Sản phẩm chất lượng cao", d: "Danh mục sản phẩm đa dạng từ các thương hiệu nội thất hàng đầu thế giới." },
                    { t: "Chính sách chiết khấu tối ưu", d: "Đảm bảo lợi nhuận và quyền lợi cạnh tranh nhất cho các đối tác." },
                    { t: "Hỗ trợ thiết kế & Kỹ thuật", d: "Cung cấp thư viện 3D, catalog và hỗ trợ kỹ thuật tận tình cho từng dự án." },
                    { t: "Vận chuyển toàn quốc", d: "Hệ thống logistics chuyên nghiệp giúp giao hàng an toàn đến mọi miền tổ quốc." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.t}</h4>
                        <p className="text-sm text-muted-foreground">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-charcoal text-cream rounded-3xl">
                  <p className="text-sm text-taupe mb-2">Liên hệ bộ phận B2B trực tiếp</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="font-bold">0909 123 456 (Mr. Quang)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="font-bold">partnership@ohouse.vn</span>
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
                <h3 className="text-2xl font-bold mb-8">Đăng Ký Hợp Tác</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tên doanh nghiệp / cá nhân</Label>
                      <Input placeholder="Nhập tên của bạn" required className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Số điện thoại liên hệ</Label>
                      <Input placeholder="Nhập SĐT" required className="h-12 rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Địa chỉ Email</Label>
                    <Input type="email" placeholder="email@congty.com" required className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loại hình hợp tác</Label>
                    <Select>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Chọn loại hình" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dealer">Đại Lý Phân Phối</SelectItem>
                        <SelectItem value="contractor">Nhà Thầu Dự Án</SelectItem>
                        <SelectItem value="architect">Kiến Trúc Sư / Thiết Kế</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nội dung trao đổi</Label>
                    <Textarea placeholder="Mô tả sơ lược về dự án hoặc yêu cầu hợp tác của bạn..." rows={5} className="rounded-xl resize-none" />
                  </div>

                  <Button type="submit" className="w-full btn-hero h-14 text-sm font-bold shadow-gold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    Gửi Yêu Cầu Hợp Tác
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}