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
  ExternalLink
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export function HeaderMenuManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    top_banner_messages: [{ text: "", link: "" }],
    top_banner_countdown: "",
    top_banner_shipping: "",
    logo_url: ""
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
          ? setData.top_banner_messages 
          : [{ text: setData.top_banner_text || "", link: setData.top_banner_link || "" }],
        top_banner_countdown: setData.top_banner_countdown ? new Date(setData.top_banner_countdown).toISOString().slice(0, 16) : ""
      });
    }
    setLoading(false);
  };

  const handleAddMessage = () => {
    setSettings({
      ...settings,
      top_banner_messages: [...settings.top_banner_messages, { text: "", link: "" }]
    });
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = [...settings.top_banner_messages];
    newMessages.splice(index, 1);
    setSettings({ ...settings, top_banner_messages: newMessages });
  };

  const handleUpdateMessage = (index: number, field: 'text' | 'link', value: string) => {
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
      
      // Lọc bỏ các tin nhắn trống
      const filteredMessages = settings.top_banner_messages.filter((m: any) => m.text.trim() !== "");
      
      const payload = {
        top_banner_messages: filteredMessages,
        // Sync ngược lại field cũ để đảm bảo tương thích nếu cần
        top_banner_text: filteredMessages[0]?.text || "",
        top_banner_link: filteredMessages[0]?.link || "",
        top_banner_countdown: settings.top_banner_countdown ? new Date(settings.top_banner_countdown).toISOString() : null,
        top_banner_shipping: settings.top_banner_shipping,
        logo_url: settings.logo_url,
        updated_at: new Date()
      };

      if (existing) {
        await supabase.from('site_settings').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('site_settings').insert(payload);
      }
      toast.success("Đã lưu cấu hình Header");
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-6">
      <div className="space-y-6">
        {/* ROW 1: TOP BANNER MESSAGES */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Megaphone className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold text-sm">Dòng 1: Danh sách thông điệp</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Hiển thị luân phiên ở thanh trên cùng</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddMessage} className="h-8 text-[10px] font-bold uppercase rounded-lg">
              <Plus className="w-3 h-3 mr-1" /> Thêm tin
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {settings.top_banner_messages.map((msg: any, idx: number) => (
              <div key={idx} className="p-4 bg-secondary/20 rounded-2xl border border-border/50 relative group/msg">
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Nội dung #{idx + 1}</Label>
                    <Input 
                      value={msg.text} 
                      onChange={e => handleUpdateMessage(idx, 'text', e.target.value)}
                      placeholder="VD: Flash Sale: GIẢM ĐẾN 60%..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Đường dẫn liên kết</Label>
                    <Input 
                      value={msg.link} 
                      onChange={e => handleUpdateMessage(idx, 'link', e.target.value)}
                      placeholder="/sale"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveMessage(idx)}
                  className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover/msg:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-dashed space-y-4">
             <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-destructive" />
                <h4 className="text-xs font-bold uppercase">Thời gian đếm ngược (Header)</h4>
             </div>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hạn kết thúc</Label>
                  <Input 
                    type="datetime-local" 
                    value={settings.top_banner_countdown} 
                    onChange={e => setSettings({...settings, top_banner_countdown: e.target.value})} 
                    className="h-11 rounded-xl"
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Text vận chuyển</Label>
                  <Input 
                    value={settings.top_banner_shipping} 
                    onChange={e => setSettings({...settings, top_banner_shipping: e.target.value})} 
                    placeholder="Miễn Phí Vận Chuyển"
                    className="h-11 rounded-xl"
                  />
               </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><LucideImage className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm">Dòng 2: Logo thương hiệu</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Thay đổi Logo hiển thị trên toàn trang</p>
            </div>
          </div>
          <ImageUpload value={settings.logo_url} onChange={(url) => setSettings({...settings, logo_url: url})} />
        </div>

        <Button onClick={handleSaveSettings} disabled={saving} className="w-full btn-hero h-14 shadow-gold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          LƯU CẤU HÌNH HEADER
        </Button>
      </div>

      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6 h-fit">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><LayoutGrid className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold text-sm">Danh mục hiển thị (Trang Chủ)</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Bật "Hiện ở Home" để hiện ở lưới danh mục</p>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.filter(c => !c.parent_id).map(cat => {
            const children = categories.filter(c => c.parent_id === cat.id);
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-border flex items-center justify-center">
                      {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                    </div>
                    <span className="font-bold text-xs">{cat.name}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold uppercase text-muted-foreground">Home</span>
                    <Switch checked={cat.show_on_home} onCheckedChange={(val) => handleUpdateCategory(cat.id, { show_on_home: val })} />
                  </div>
                </div>
                {children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-2 ml-8 border-l-2 border-dashed border-border/60">
                    <span className="text-[11px] font-medium text-charcoal/70">— {child.name}</span>
                    <Switch checked={child.show_on_home} onCheckedChange={(val) => handleUpdateCategory(child.id, { show_on_home: val })} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}