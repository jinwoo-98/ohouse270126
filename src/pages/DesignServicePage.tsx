import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Zap, CheckCircle, Send, ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroLivingRoom from "@/assets/hero-living-room.jpg";

const steps = [
  { icon: Zap, title: "Bước 1: Đăng Ký", desc: "Điền thông tin và yêu cầu thiết kế của bạn." },
  { icon: LayoutGrid, title: "Bước 2: Tư Vấn", desc: "Kiến trúc sư liên hệ, khảo sát và lên ý tưởng sơ bộ." },
  { icon: CheckCircle, title: "Bước 3: Hoàn Thiện", desc: "Nhận bản vẽ 3D miễn phí và báo giá chi tiết." },
];

export default function DesignServicePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    room: "",
    budget: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('design_requests')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          room_type: formData.room,
          budget: formData.budget,
          message: formData.message
        });

      if (error) throw error;
      
      toast.success("Đăng ký thành công! Kiến trúc sư của OHOUSE sẽ liên hệ với bạn sớm nhất.");
      setFormData({ name: "", phone: "", email: "", room: "", budget: "", message: "" });
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Dịch vụ thiết kế miễn phí" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-primary">Thiết Kế Nội Thất Miễn Phí</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Biến không gian sống trong mơ thành hiện thực với dịch vụ tư vấn 3D miễn phí từ OHOUSE
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-luxury">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Quy Trình 3 Bước Đơn Giản</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-secondary/50 rounded-lg shadow-subtle"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-cream">
          <div className="container-luxury max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Đăng Ký Nhận Tư Vấn</h2>
            <p className="text-muted-foreground text-center mb-8">
              Vui lòng điền thông tin chi tiết để chúng tôi có thể phục vụ bạn tốt nhất.
            </p>
            <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 md:p-8 shadow-elevated space-y-4">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room">Không gian cần thiết kế</Label>
                  <Select onValueChange={val => setFormData({...formData, room: val})} value={formData.room}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn không gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living">Phòng Khách</SelectItem>
                      <SelectItem value="bedroom">Phòng Ngủ</SelectItem>
                      <SelectItem value="dining">Phòng Ăn</SelectItem>
                      <SelectItem value="office">Văn Phòng</SelectItem>
                      <SelectItem value="full">Trọn Gói Căn Hộ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Ngân sách dự kiến</Label>
                  <Select onValueChange={val => setFormData({...formData, budget: val})} value={formData.budget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngân sách" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">Dưới 50 triệu</SelectItem>
                      <SelectItem value="100">50 - 100 triệu</SelectItem>
                      <SelectItem value="200">100 - 200 triệu</SelectItem>
                      <SelectItem value="500">Trên 200 triệu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mô tả yêu cầu</Label>
                <Textarea 
                  id="message" 
                  placeholder="Mô tả phong cách, kích thước, hoặc bất kỳ yêu cầu đặc biệt nào..."
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Gửi Yêu Cầu Thiết Kế
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}