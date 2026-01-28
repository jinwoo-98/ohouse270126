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
  ExternalLink,
  Calendar
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
    top_banner_messages: [{ text: "", link: "", end_time: "" }],
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
          ? setData.top_banner_messages.map((m: any) => ({
              ...m,
              // Đảm bảo định dạng datetime-local (YYYY-MM-DDThh:mm)
              end_time: m.end_time ? new Date(m.end_time).toISOString().slice(0, 16) : ""
            }))
          : [{ text: "", link: "", end_time: "" }]
      });
    }
    setLoading(false);
  };

  const handleAddMessage = () => {
    setSettings({
      ...settings,
      top_banner_messages: [...settings.top_banner_messages, { text: "", link: "", end_time: "" }]
    });
  };

  const handleRemoveMessage = (index: number) => {
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
        .filter((m: any) => m.text.trim() !== "")
        .map((m: any) => ({
          ...m,
          end_time: m.end_time ? new Date(m.end_time).toISOString() : null
        }));
      
      const payload = {
        top_banner_messages: filteredMessages,
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
      fetchData(); // Refresh to clean format
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
        {/* ROW 1: DYNAMIC MESSAGES WITH COUNTDOWN */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Megaphone className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold text-sm">Dòng 1: Danh sách thông điệp</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Nhiều tin nhắn kèm đếm ngược riêng biệt</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddMessage} className="h-8 text-[10px] font-bold uppercase rounded-lg">
              <Plus className="w-3 h-3 mr-1" /> Thêm tin
            </Button>
          </div>
          
          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {settings.top_banner_messages.map((msg: any, idx: number) => (
              <div key={idx} className="p-5 bg-secondary/20 rounded-2xl border border-border/50 relative group/msg space-y-4">
                <div className="flex items-center justify-between">
                   <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] uppercase font-bold px-2">Thông điệp #{idx + 1}</Badge>
                   <button 
                    onClick={() => handleRemoveMessage(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nội dung hiển thị</Label>
                    <Input 
                      value={msg.text} 
                      onChange={e => handleUpdateMessage(idx, 'text', e.target.value)}
                      placeholder="VD: Xả kho 50% - Chỉ hôm nay"
                      className="h-10 text-sm font-bold rounded-xl"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Link liên kết</Label>
                      <Input 
                        value={msg.link} 
                        onChange={e => handleUpdateMessage(idx, 'link', e.target.value)}
                        placeholder="/sale"
                        className="h-10 text-sm rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-destructive" /> Hạn đếm ngược
                      </Label>
                      <Input 
                        type="datetime-local" 
                        value={msg.end_time} 
                        onChange={e => handleUpdateMessage(idx, 'end_time', e.target.value)}
                        className="h-10 text-sm rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-dashed">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Text vận chuyển (Bên phải Header)</Label>
              <Input 
                value={settings.top_banner_shipping} 
                onChange={e => setSettings({...settings, top_banner_shipping: e.target.value})} 
                placeholder="Miễn Phí Vận Chuyển"
                className="h-11 rounded-xl"
              />
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