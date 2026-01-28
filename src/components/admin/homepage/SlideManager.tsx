"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function SlideManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    const { data } = await supabase.from('slides').select('*').order('display_order');
    setSlides(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: editingSlide?.description || "",
      cta_text: formData.get('cta_text'),
      cta_link: formData.get('cta_link'),
      image_url: editingSlide?.image_url || '',
      is_active: editingSlide?.is_active ?? true,
      text_color: formData.get('text_color'),
      text_align: formData.get('text_align')
    };

    if (!payload.image_url) { toast.error("Vui lòng tải ảnh lên"); return; }

    try {
      if (editingSlide?.id) {
        await supabase.from('slides').update(payload).eq('id', editingSlide.id);
      } else {
        await supabase.from('slides').insert({ ...payload, display_order: slides.length + 1 });
      }
      toast.success("Đã lưu slide");
      setIsOpen(false);
      fetchSlides();
    } catch (e) { toast.error("Lỗi lưu dữ liệu"); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('slides').update({ is_active: !current }).eq('id', id);
    fetchSlides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa slide này?")) return;
    await supabase.from('slides').delete().eq('id', id);
    fetchSlides();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingSlide({ text_color: '#ffffff', text_align: 'center', is_active: true }); setIsOpen(true); }} className="btn-hero h-10 shadow-gold">
          <Plus className="w-4 h-4 mr-2" /> Thêm Slide
        </Button>
      </div>

      <div className="grid gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-6 items-center ${!slide.is_active ? 'opacity-60' : ''}`}>
            <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-secondary/30 shrink-0 border group">
              <img src={slide.image_url} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-1 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{slide.subtitle}</p>
              <h3 className="font-bold text-lg">{slide.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={slide.is_active} onCheckedChange={() => toggleActive(slide.id, slide.is_active)} />
              <Button variant="ghost" size="icon" onClick={() => { setEditingSlide(slide); setIsOpen(true); }}><Edit className="w-4 h-4 text-blue-600" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl rounded-3xl h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader><DialogTitle>Cấu Hình Slide</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2"><Label>Tiêu đề chính</Label><Input name="title" defaultValue={editingSlide?.title} required /></div>
                <div className="space-y-2"><Label>Tiêu đề phụ</Label><Input name="subtitle" defaultValue={editingSlide?.subtitle} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Màu chữ</Label><Input type="color" name="text_color" defaultValue={editingSlide?.text_color || '#ffffff'} /></div>
                  <div className="space-y-2">
                    <Label>Căn lề</Label>
                    <Select name="text_align" defaultValue={editingSlide?.text_align || 'center'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="left">Trái</SelectItem><SelectItem value="center">Giữa</SelectItem><SelectItem value="right">Phải</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ảnh nền</Label>
                <ImageUpload value={editingSlide?.image_url} onChange={(url) => setEditingSlide({...editingSlide, image_url: url})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả chi tiết</Label>
              <RichTextEditor value={editingSlide?.description || ""} onChange={(val) => setEditingSlide({...editingSlide, description: val})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nút bấm (CTA)</Label><Input name="cta_text" defaultValue={editingSlide?.cta_text} /></div>
              <div className="space-y-2"><Label>Link nút bấm</Label><Input name="cta_link" defaultValue={editingSlide?.cta_link} /></div>
            </div>
            <Button type="submit" className="w-full btn-hero h-12">Lưu Thay Đổi</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}