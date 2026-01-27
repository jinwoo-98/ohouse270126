import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Building2, Users, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactMethods = [
  { icon: Phone, title: "Hotline", value: "1900 888 999", desc: "Miễn phí cuộc gọi" },
  { icon: Mail, title: "Email", value: "info@ohouse.vn", desc: "Phản hồi trong 24h" },
  { icon: MapPin, title: "Showroom", value: "123 Nguyễn Huệ, Q.1, HCM", desc: "Xem bản đồ" },
  { icon: Clock, title: "Giờ làm việc", value: "8:00 - 21:00", desc: "Thứ 2 - Chủ nhật" },
];

const cooperationTypes = [
  { icon: Building2, title: "Đại Lý", desc: "Trở thành đại lý phân phối sản phẩm OHOUSE" },
  { icon: Users, title: "Nhà Thầu", desc: "Hợp tác dự án nội thất công trình" },
  { icon: MessageSquare, title: "Đối Tác", desc: "Liên kết kinh doanh và truyền thông" },
];

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: formData.subject || "Liên hệ chung",
          message: formData.message
        });

      if (error) throw error;
      
      toast.success("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm nhất.");
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-charcoal text-cream py-16">
          <div className="container-luxury text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Liên Hệ & Hợp Tác</h1>
              <p className="text-taupe max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container-luxury">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {contactMethods.map((method, index) => (
                <motion.div key={method.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="text-center p-6 bg-card rounded-lg shadow-subtle">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{method.title}</h3>
                  <p className="text-primary font-medium text-sm">{method.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{method.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-secondary/30">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold mb-6">Gửi Yêu Cầu Tư Vấn</h2>
                <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 shadow-subtle space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input id="name" placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input id="phone" placeholder="0909 xxx xxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Chủ đề</Label>
                    <Select onValueChange={val => setFormData({...formData, subject: val})}>
                      <SelectTrigger><SelectValue placeholder="Chọn chủ đề" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Tư vấn sản phẩm</SelectItem>
                        <SelectItem value="project">Thiết kế dự án</SelectItem>
                        <SelectItem value="order">Đơn hàng</SelectItem>
                        <SelectItem value="warranty">Bảo hành</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Nội dung *</Label>
                    <Textarea id="message" placeholder="Mô tả yêu cầu của bạn..." rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Gửi Yêu Cầu
                  </Button>
                </form>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold mb-6">Hợp Tác Kinh Doanh</h2>
                <p className="text-muted-foreground mb-6">OHOUSE luôn chào đón các đối tác tiềm năng. Hãy liên hệ với chúng tôi để khám phá cơ hội hợp tác cùng phát triển.</p>
                <div className="space-y-4">
                  {cooperationTypes.map((type, index) => (
                    <div key={type.title} className="flex items-start gap-4 bg-card rounded-lg p-5 shadow-subtle hover:shadow-medium transition-shadow cursor-pointer group">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <type.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-charcoal text-cream rounded-lg">
                  <h3 className="font-semibold mb-2">Liên hệ hợp tác trực tiếp</h3>
                  <p className="text-taupe text-sm mb-4">Bộ phận kinh doanh B2B</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><span>0909 123 456</span></p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span>business@ohouse.vn</span></p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="h-[400px] bg-muted">
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Bản đồ Showroom OHOUSE</p>
              <p className="text-sm">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}