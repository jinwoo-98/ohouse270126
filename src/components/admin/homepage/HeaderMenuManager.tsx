"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutGrid, 
  ImageIcon, 
  Loader2, 
  Megaphone, 
  Image as LucideImage, 
  Save, 
  Plus, 
  Trash2, 
  Clock,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  Truck,
  Palette
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { cn } from "@/lib/utils";

export function HeaderMenuManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    top_banner_messages: [{ content: "", end_time: "" }], // Đổi từ 'text' sang 'content'
    top_banner_shipping: "",
    logo_url: "",
    shipping_modal_title: "",
    shipping_modal_content: "",
    top_banner_text_color: "#FFFFFF",
    top_banner_countdown_color: "#000000",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from('categories').select('*').order('display_order');
    const { data: setData } = await supabase.from('site_settings').select('*').single();
    
    setCategories(catData || []);
    if (setData) {
      setSettings({
        ...setData,
        top_banner_messages: (setData.top_banner_messages && setData.top_banner_messages.length > 0) 
          ? setData.top_banner_messages.map((m: any) => ({
              ...m,
              // Đảm bảo trường content tồn tại, và end_time được format
              content: m.content || m.text || "", // Fallback cho trường hợp dữ liệu cũ
              end_time: m.end_time ? new Date(m.end_time).toISOString().slice(0, 16) : ""
            }))
          : [{ content: "", end_time: "" }],
        top_banner_text_color: setData.top_banner_text_color || "#FFFFFF",
        top_banner_countdown_color: setData.top_banner_countdown_color || "#000000",
      });
    }
    setLoading(false);
  };

  const handleAddMessage = () => {
    setSettings({
      ...settings,
      top_banner_messages: [...settings.top_banner_messages, { content: "", end_time: "" }]
    });
  };

  const handleRemoveMessage = (index: number) => {
    if (settings.top_banner_messages.length === 1) {
      toast.error("Phải có ít nhất một thông điệp hiển thị.");
      return;
    }
    const newMessages = [...settings.top_banner_messages];
    newMessages.splice(index, 1);
    setSettings({ ...settings, top_banner_messages: newMessages });
  };

  const handleUpdateMessage = (index: number, field: string, value: string) => {
    const newMessages = [...settings.top_banner_messages];
    newMessages[index][field] = value;
    setSettings({ ...settings, top_banner_messages: newMessages });
  };

  const handleUpdateCategory = async (id: string, payload: any) => {
    try {
      const { error } = await supabase.from('categories').update(payload).eq('id', id);
      if (error) throw error;
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
      toast.success("Đã cập nhật danh mục");
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').single();
      
      const filteredMessages = settings.top_banner_messages
        .filter((m: any) => m.content.trim() !== "")
        .map((m: any) => ({
          ...m,
          end_time: m.end_time ? new Date(m.end_time).toISOString() : null
        }));
      
      const payload = {
        top_banner_messages: filteredMessages,
        top_banner_shipping: settings.top_banner_shipping,
        logo_url: settings.logo_url,
        shipping_modal_title: settings.shipping_modal_title,
        shipping_modal_content: settings.shipping_modal_content,
        top_banner_text_color: settings.top_banner_text_color,
        top_banner_countdown_color: settings.top_banner_countdown_color,
        updated_at: new Date()
      };

      if (existing) {
        await supabase.from('site_settings').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('site_settings').insert(payload);
      }
      toast.success("Đã lưu cấu hình Header");
      fetchData();
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-6">
      <div className="space-y-8">
        {/* ROW 1: CAMPAIGN MESSAGES */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Megaphone className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Tin nhắn Top Banner</h3>
                <p className="text-[10px] text-muted-foreground font-medium italic">Các thông báo chạy ở đầu trang</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddMessage} className="h-9 px-4 text-[10px] font-bold uppercase rounded-xl border-primary/20 text-primary hover:bg-primary/5">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm tin
            </Button>
          </div>
          
          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {settings.top_banner_messages.map((msg: any, idx: number) => {
              const isExpired = msg.end_time && new Date(msg.end_time) < new Date();
              
              return (
                <div key={idx} className={cn(
                  "p-6 rounded-2xl border transition-all relative group/msg shadow-sm",
                  isExpired ? "bg-gray-50 border-gray-200 opacity-80" : "bg-white border-border/50 hover:border-primary/40"
                )}>
                  <div className="flex items-center justify-between mb-5">
                     <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] uppercase font-bold px-2 py-0.5">Chiến dịch #{idx + 1}</Badge>
                        {isExpired && <Badge variant="destructive" className="text-[9px] uppercase font-bold px-2 py-0.5">Hết hạn</Badge>}
                     </div>
                     <button 
                      onClick={() => handleRemoveMessage(idx)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        Nội dung thông báo (Hỗ trợ Rich Text/Link)
                      </Label>
                      <RichTextEditor 
                        value={msg.content} 
                        onChange={val => handleUpdateMessage(idx, 'content', val)}
                        placeholder="Nhập nội dung, sử dụng công cụ để chèn link và màu chữ..."
                      />
                      <p className="text-[10px] text-muted-foreground italic">Sử dụng công cụ chèn link và màu chữ trong trình soạn thảo.</p>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-dashed border-border/40">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-destructive" /> Thời gian tự động kết thúc
                      </Label>
                      <Input 
                        type="datetime-local" 
                        value={msg.end_time} 
                        onChange={e => handleUpdateMessage(idx, 'end_time', e.target.value)}
                        className="h-12 text-sm rounded-xl focus:ring-1 border-primary/20 bg-primary/5"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-dashed space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Vận chuyển (Phải Header)</Label>
              <Input 
                value={settings.top_banner_shipping} 
                onChange={e => setSettings({...settings, top_banner_shipping: e.target.value})} 
                placeholder="Miễn Phí Vận Chuyển Đơn Từ 5TR"
                className="h-12 rounded-xl bg-secondary/30 border-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* NEW SECTION: COLOR CONFIG */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Palette className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Màu sắc Top Banner</h3>
              <p className="text-[10px] text-muted-foreground font-medium">Tùy chỉnh màu chữ và bộ đếm giờ</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Màu chữ thông báo</Label>
              <div className="flex gap-2">
                <Input type="color" value={settings.top_banner_text_color} onChange={e => setSettings({...settings, top_banner_text_color: e.target.value})} className="w-12 h-12 p-1 rounded-lg shrink-0" />
                <Input value={settings.top_banner_text_color} onChange={e => setSettings({...settings, top_banner_text_color: e.target.value})} className="font-mono text-[10px] uppercase h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Màu bộ đếm giờ</Label>
              <div className="flex gap-2">
                <Input type="color" value={settings.top_banner_countdown_color} onChange={e => setSettings({...settings, top_banner_countdown_color: e.target.value})} className="w-12 h-12 p-1 rounded-lg shrink-0" />
                <Input value={settings.top_banner_countdown_color} onChange={e => setSettings({...settings, top_banner_countdown_color: e.target.value})} className="font-mono text-[10px] uppercase h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* SHIPPING MODAL CONFIG */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Truck className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Nội dung Bảng vận chuyển</h3>
              <p className="text-[10px] text-muted-foreground font-medium">Hiện khi nhấn vào mục vận chuyển</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu đề bảng thông báo</Label>
              <Input 
                value={settings.shipping_modal_title} 
                onChange={e => setSettings({...settings, shipping_modal_title: e.target.value})} 
                placeholder="Ví dụ: Miễn Phí Vận Chuyển"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nội dung chi tiết</Label>
              <RichTextEditor 
                value={settings.shipping_modal_content} 
                onChange={val => setSettings({...settings, shipping_modal_content: val})} 
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSaveSettings} disabled={saving} className="w-full btn-hero h-14 shadow-gold rounded-2xl flex items-center justify-center gap-3">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          CẬP NHẬT CẤU HÌNH HEADER
        </Button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><LucideImage className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Logo Website</h3>
              <p className="text-[10px] text-muted-foreground font-medium">Hình ảnh nhận diện thương hiệu</p>
            </div>
          </div>
          <ImageUpload value={settings.logo_url} onChange={(url) => setSettings({...settings, logo_url: url})} />
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><LayoutGrid className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Danh mục ở Trang Chủ</h3>
              <p className="text-[10px] text-muted-foreground font-medium">Bật "Hiện ở Home" để hiện ở lưới danh mục</p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.filter(c => !c.parent_id).map(cat => {
              const children = categories.filter(c => c.parent_id === cat.id);
              return (
                <div key={cat.id} className="space-y-2 border-b border-border/40 pb-4 last:border-0">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border border-border/50 flex items-center justify-center shadow-sm">
                        {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-charcoal">{cat.name}</span>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">Thứ tự: {cat.display_order}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Hiện ở Home</span>
                      <Switch checked={cat.show_on_home} onCheckedChange={(val) => handleUpdateCategory(cat.id, { show_on_home: val })} />
                    </div>
                  </div>
                  {children.map(child => (
                    <div key={child.id} className="flex items-center justify-between p-2.5 ml-10 border-l-2 border-dashed border-border/40 hover:bg-secondary/10 rounded-r-xl transition-colors">
                      <span className="text-[11px] font-medium text-charcoal/70">— {child.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-bold uppercase text-muted-foreground">Hiện Home</span>
                        <Switch checked={child.show_on_home} onCheckedChange={(val) => handleUpdateCategory(child.id, { show_on_home: val })} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}