import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Zap, CheckCircle, Send, ArrowRight, Loader2, ChevronDown, ChevronUp, DollarSign, DraftingCompass } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = { Zap, LayoutGrid, CheckCircle, DollarSign, DraftingCompass };

interface Step {
  icon_name: string;
  title: string;
  desc: string;
}

interface Option {
  label: string;
  value: string;
}

export default function DesignServicePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [config, setConfig] = useState<{ hero_image_url: string | null, steps: Step[], room_options: Option[], budget_options: Option[] }>({
    hero_image_url: null,
    steps: [],
    room_options: [],
    budget_options: [],
  });
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    room: [] as string[], // Changed to array for multi-select
    budget: "",
    message: ""
  });

  useEffect(() => {
    fetchPageContent();
    fetchDesignConfig();
  }, []);

  const fetchPageContent = async () => {
    const { data } = await supabase
      .from('site_pages')
      .select('content')
      .eq('slug', 'thiet-ke')
      .single();
    
    if (data?.content) {
      setPageContent(data.content);
    }
  };
  
  const fetchDesignConfig = async () => {
    setIsConfigLoading(true);
    try {
      const { data } = await supabase
        .from('design_service_config')
        .select('*')
        .single();
        
      if (data) {
        setConfig({
          hero_image_url: data.hero_image_url,
          steps: data.steps || [],
          room_options: data.room_options || [],
          budget_options: data.budget_options || [],
        });
      }
    } catch (e) {
      console.error("Error fetching design config:", e);
    } finally {
      setIsConfigLoading(false);
    }
  };

  const handleRoomToggle = (roomValue: string) => {
    setFormData(prev => {
      const currentRooms = prev.room;
      if (currentRooms.includes(roomValue)) {
        return { ...prev, room: currentRooms.filter(v => v !== roomValue) };
      } else {
        return { ...prev, room: [...currentRooms, roomValue] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.room.length === 0) {
      toast.error("Vui lòng nhập họ tên, số điện thoại và chọn ít nhất một không gian.");
      return;
    }

    setIsLoading(true);
    
    // Format room selection for DB insertion
    const roomString = formData.room.map(val => {
      const option = config.room_options.find(o => o.value === val);
      return option ? option.label : val;
    }).join(", ");

    try {
      const { error } = await supabase
        .from('design_requests')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          room_type: roomString, // Save as string of selected rooms
          budget: formData.budget,
          message: formData.message
        });

      if (error) throw error;
      
      toast.success("Đăng ký thành công! Kiến trúc sư của OHOUSE sẽ liên hệ với bạn sớm nhất.");
      setFormData({ name: "", phone: "", email: "", room: [], budget: "", message: "" });
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isConfigLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative h-[50vh] overflow-hidden">
          {config.hero_image_url ? (
            <img src={config.hero_image_url} alt="Dịch vụ thiết kế miễn phí" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
              <LayoutGrid className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-primary">Thiết Kế Nội Thất Miễn Phí</h1>
              <div className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                {pageContent ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: pageContent }} 
                    className="prose prose-lg prose-invert max-w-none text-cream/80 prose-p:text-cream/80 prose-ul:text-cream/80 prose-li:text-cream/80"
                  />
                ) : (
                  <p>Biến không gian sống trong mơ thành hiện thực với dịch vụ tư vấn 3D miễn phí từ OHOUSE</p>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-luxury">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Quy Trình {config.steps.length} Bước Chuyên Nghiệp</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {config.steps.map((step, index) => {
                const Icon = iconMap[step.icon_name] || Zap;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-6 bg-secondary/50 rounded-lg shadow-subtle"
                  >
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </motion.div>
                );
              })}
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
                  <Label htmlFor="room">Không gian cần thiết kế *</Label>
                  <div className="p-4 border rounded-xl bg-secondary/30 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {config.room_options.map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox 
                          checked={formData.room.includes(opt.value)} 
                          onCheckedChange={() => handleRoomToggle(opt.value)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className={cn("text-sm font-medium", formData.room.includes(opt.value) && "font-bold text-charcoal")}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Bạn có thể chọn nhiều không gian.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Ngân sách dự kiến</Label>
                  <Select onValueChange={val => setFormData({...formData, budget: val})} value={formData.budget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngân sách" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.budget_options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
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