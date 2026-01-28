import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Edit, Trash2, Loader2, Save, Image as ImageIcon, 
  ArrowUp, ArrowDown, MonitorPlay, Truck, Shield, RefreshCw, CreditCard, Gift, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function HomepageManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [usps, setUsps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Slide Form State
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  
  // USP Form State
  const [isUspOpen, setIsUspOpen] = useState(false);
  const [editingUsp, setEditingUsp] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: slidesData } = await supabase.from('slides').select('*').order('display_order');
    const { data: uspsData } = await supabase.from('usps').select('*').order('display_order');
    setSlides(slidesData || []);
    setUsps(uspsData || []);
    setLoading(false);
  };

  // --- SLIDE HANDLERS ---
  const handleSaveSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      cta_text: formData.get('cta_text'),
      cta_link: formData.get('cta_link'),
      image_url: editingSlide?.image_url || '',
      is_active: true
    };

    if (!payload.image_url) {
      toast.error("Vui lòng tải ảnh lên");
      return;
    }

    try {
      if (editingSlide?.id) {
        await supabase.from('slides').update(payload).eq('id', editingSlide.id);
      } else {
        await supabase.from('slides').insert({ ...payload, display_order: slides.length + 1 });
      }
      toast.success("Đã lưu Slide");
      setIsSlideOpen(false);
      setEditingSlide(null);
      fetchData();
    } catch (error) { toast.error("Lỗi lưu slide"); }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Xóa slide này?")) return;
    await supabase.from('slides').delete().eq('id', id);
    fetchData();
  };

  // --- USP HANDLERS ---
  const handleSaveUsp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      icon_name: formData.get('icon_name'),
    };

    try {
      if (editingUsp?.id) {
        await supabase.from('usps').update(payload).eq('id', editingUsp.id);
      } else {
        await supabase.from('usps').insert({ ...payload, display_order: usps.length + 1 });
      }
      toast.success("Đã lưu thông tin");
      setIsUspOpen(false);
      setEditingUsp(null);
      fetchData();
    } catch (error) { toast.error("Lỗi lưu thông tin"); }
  };

  const deleteUsp = async (id: string) => {
    if (!confirm("Xóa mục này?")) return;
    await supabase.from('usps').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-primary" /> Quản Lý Trang Chủ
        </h1>
        <p className="text-muted-foreground text-sm">Tùy chỉnh Banner Slide và thanh Dịch vụ nổi bật.</p>
      </div>

      <Tabs defaultValue="slides">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start">
          <TabsTrigger value="slides" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Banner Slideshow</TabsTrigger>
          <TabsTrigger value="usps" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Thanh Dịch Vụ</TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingSlide({}); setIsSlideOpen(true); }} className="btn-hero h-10 shadow-gold"><Plus className="w-4 h-4 mr-2" /> Thêm Slide Mới</Button>
          </div>

          <div className="grid gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-secondary/30 shrink-0 border">
                  {slide.image_url ? <img src={slide.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 m-auto mt-8 text-muted-foreground" />}
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{slide.subtitle}</p>
                  <h3 className="font-bold text-lg">{slide.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{slide.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingSlide(slide); setIsSlideOpen(true); }}><Edit className="w-4 h-4 text-blue-600" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteSlide(slide.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usps" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingUsp({}); setIsUspOpen(true); }} className="btn-hero h-10 shadow-gold"><Plus className="w-4 h-4 mr-2" /> Thêm Dịch Vụ</Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {usps.map((usp) => (
              <div key={usp.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingUsp(usp); setIsUspOpen(true); }}><Edit className="w-3 h-3 text-blue-600" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteUsp(usp.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                  {usp.icon_name === 'Truck' && <Truck className="w-6 h-6" />}
                  {usp.icon_name === 'Shield' && <Shield className="w-6 h-6" />}
                  {usp.icon_name === 'RefreshCw' && <RefreshCw className="w-6 h-6" />}
                  {usp.icon_name === 'CreditCard' && <CreditCard className="w-6 h-6" />}
                  {usp.icon_name === 'Gift' && <Gift className="w-6 h-6" />}
                  {usp.icon_name === 'HelpCircle' && <HelpCircle className="w-6 h-6" />}
                </div>
                <h3 className="font-bold text-sm">{usp.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{usp.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Edit Slide */}
      <Dialog open={isSlideOpen} onOpenChange={setIsSlideOpen}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader><DialogTitle>{editingSlide?.id ? "Sửa Slide" : "Thêm Slide Mới"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveSlide} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề chính (Lớn)</Label>
                  <Input name="title" defaultValue={editingSlide?.title} required placeholder="VD: Phòng Khách Sang Trọng" />
                </div>
                <div className="space-y-2">
                  <Label>Tiêu đề phụ (Nhỏ)</Label>
                  <Input name="subtitle" defaultValue={editingSlide?.subtitle} placeholder="VD: Bộ sưu tập 2024" />
                </div>
                <div className="space-y-2">
                  <Label>Mô tả ngắn</Label>
                  <Textarea name="description" defaultValue={editingSlide?.description} placeholder="Mô tả ngắn gọn..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nút bấm (CTA)</Label>
                    <Input name="cta_text" defaultValue={editingSlide?.cta_text || "Khám Phá Ngay"} />
                  </div>
                  <div className="space-y-2">
                    <Label>Link nút bấm</Label>
                    <Input name="cta_link" defaultValue={editingSlide?.cta_link || "/"} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh Slide</Label>
                <ImageUpload 
                  value={editingSlide?.image_url} 
                  onChange={(url) => setEditingSlide(prev => ({...prev, image_url: url}))} 
                />
              </div>
            </div>
            <Button type="submit" className="w-full btn-hero h-12">Lưu Slide</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit USP */}
      <Dialog open={isUspOpen} onOpenChange={setIsUspOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>{editingUsp?.id ? "Sửa Dịch Vụ" : "Thêm Dịch Vụ"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveUsp} className="space-y-4">
            <div className="space-y-2">
              <Label>Tiêu đề dịch vụ</Label>
              <Input name="title" defaultValue={editingUsp?.title} required placeholder="VD: Miễn phí vận chuyển" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả phụ</Label>
              <Input name="description" defaultValue={editingUsp?.description} placeholder="VD: Cho đơn từ 5 triệu" />
            </div>
            <div className="space-y-2">
              <Label>Biểu tượng (Icon)</Label>
              <Select name="icon_name" defaultValue={editingUsp?.icon_name || "Truck"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Xe tải (Vận chuyển)</SelectItem>
                  <SelectItem value="Shield">Khiên (Bảo hành)</SelectItem>
                  <SelectItem value="RefreshCw">Vòng xoay (Đổi trả)</SelectItem>
                  <SelectItem value="CreditCard">Thẻ (Thanh toán)</SelectItem>
                  <SelectItem value="Gift">Hộp quà (Ưu đãi)</SelectItem>
                  <SelectItem value="HelpCircle">Hỏi chấm (Hỗ trợ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full btn-hero h-12">Lưu Dịch Vụ</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}