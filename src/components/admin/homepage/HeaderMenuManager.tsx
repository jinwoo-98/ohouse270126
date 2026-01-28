"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, ImageIcon, Upload, Loader2, Megaphone, Flag, Image as LucideImage, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export function HeaderMenuManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    top_banner_text: "",
    top_banner_link: "",
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
        top_banner_countdown: setData.top_banner_countdown ? new Date(setData.top_banner_countdown).toISOString().slice(0, 16) : ""
      });
    }
    setLoading(false);
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
      const payload = {
        top_banner_text: settings.top_banner_text,
        top_banner_link: settings.top_banner_link,
        top_banner_countdown: settings.top_banner_countdown || null,
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
      {/* CỘT 1: QUẢN LÝ DÒNG 1 & 2 HEADER */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Megaphone className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold">Dòng 1: Thanh thông báo (Top Banner)</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Nội dung chạy ở trên cùng website</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Thông điệp chính</Label>
              <Input 
                value={settings.top_banner_text} 
                onChange={e => setSettings({...settings, top_banner_text: e.target.value})}
                placeholder="VD: Flash Sale: GIẢM ĐẾN 60%..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Link khi nhấn</Label>
                <Input value={settings.top_banner_link} onChange={e => setSettings({...settings, top_banner_link: e.target.value})} placeholder="/sale" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Hạn đếm ngược</Label>
                <Input 
                  type="datetime-local" 
                  value={settings.top_banner_countdown} 
                  onChange={e => setSettings({...settings, top_banner_countdown: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Thông tin vận chuyển (Bên phải)</Label>
              <Input value={settings.top_banner_shipping} onChange={e => setSettings({...settings, top_banner_shipping: e.target.value})} placeholder="Miễn Phí Vận Chuyển" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><LucideImage className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold">Dòng 2: Logo thương hiệu</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Logo hiển thị chính trên website</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <ImageUpload value={settings.logo_url} onChange={(url) => setSettings({...settings, logo_url: url})} />
            <p className="text-[10px] text-muted-foreground italic">Ảnh PNG trong suốt sẽ hiển thị đẹp nhất.</p>
          </div>
        </div>

        <Button onClick={handleSaveSettings} disabled={saving} className="w-full btn-hero h-14 shadow-gold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          LƯU CẤU HÌNH HEADER
        </Button>
      </div>

      {/* CỘT 2: QUẢN LÝ DANH MỤC TRANG CHỦ */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6 h-fit">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><LayoutGrid className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold">Danh mục hiển thị (Trang Chủ)</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Bật "Hiện ở Home" và tải ảnh để hiện ở lưới danh mục</p>
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
                    <span className="font-bold text-sm">{cat.name}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold uppercase text-muted-foreground">Hiện ở Home</span>
                    <Switch checked={cat.show_on_home} onCheckedChange={(val) => handleUpdateCategory(cat.id, { show_on_home: val })} />
                  </div>
                </div>
                {children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-2 ml-8 border-l-2 border-dashed border-border/60">
                    <span className="text-xs font-medium text-charcoal/70">— {child.name}</span>
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