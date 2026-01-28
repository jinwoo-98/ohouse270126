"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Layers, ChevronRight, ImageIcon, Upload, Loader2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export function HeaderMenuManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
  };

  const updateCategory = async (id: string, payload: any) => {
    try {
      const { error } = await supabase.from('categories').update(payload).eq('id', id);
      if (error) throw error;
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
      toast.success("Đã cập nhật thành công");
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    }
  };

  // Helper render cho một dòng danh mục (dùng đệ quy hoặc lặp)
  const renderCategoryRow = (cat: any, depth = 0) => {
    const children = categories.filter(c => c.parent_id === cat.id);
    
    return (
      <div key={cat.id} className="space-y-2">
        <div className={`flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-secondary/30 transition-colors ${depth > 0 ? 'ml-8 border-l-2 border-dashed border-border/60' : 'bg-white shadow-sm border-border/40'}`}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Thumbnail & Upload area */}
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-border flex items-center justify-center">
                {cat.image_url ? (
                  <img src={cat.image_url} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-lg">
                <Upload className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    toast.loading("Đang tải ảnh...", { id: 'upload' });
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${cat.slug}_${Date.now()}.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file);
                    if (uploadError) { toast.error("Lỗi tải ảnh", { id: 'upload' }); return; }
                    
                    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                    await updateCategory(cat.id, { image_url: publicUrl });
                    toast.success("Đã cập nhật ảnh", { id: 'upload' });
                  }}
                />
              </label>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {depth > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                <span className={`font-bold truncate ${depth === 0 ? 'text-sm' : 'text-xs text-charcoal/80'}`}>{cat.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">/{cat.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Hiện ở Home</span>
              <Switch 
                checked={cat.show_on_home} 
                onCheckedChange={(val) => updateCategory(cat.id, { show_on_home: val })} 
              />
            </div>
          </div>
        </div>

        {children.map(child => renderCategoryRow(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-6">
      {/* CỘT 1: QUẢN LÝ DANH MỤC TRANG CHỦ & ẢNH */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><LayoutGrid className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold">Danh mục sản phẩm (Trang Chủ)</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Bật "Hiện ở Home" và tải ảnh để hiển thị ở lưới danh mục</p>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.filter(c => !c.parent_id).map(parent => renderCategoryRow(parent))}
        </div>
      </div>

      {/* CỘT 2: QUẢN LÝ MENU HEADER (ẨN/HIỆN CHUNG) */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layers className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold">Quản lý Menu Header (Hàng 3 & 4)</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Ẩn/Hiện các mục trên thanh điều hướng website</p>
          </div>
        </div>
        
        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {['secondary', 'main'].map(loc => (
            <div key={loc} className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 p-2 rounded-lg text-center">
                {loc === 'main' ? 'Hàng 4: Menu Sản Phẩm' : 'Hàng 3: Menu Dịch Vụ & Hỗ Trợ'}
              </h4>
              <div className="space-y-2">
                {categories.filter(c => !c.parent_id && c.menu_location === loc).map(parent => (
                  <div key={parent.id} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{parent.name}</span>
                        {parent.is_highlight && <Badge className="bg-red-500 text-[8px] h-4 uppercase">Sale</Badge>}
                      </div>
                      <Switch checked={parent.is_visible} onCheckedChange={(val) => updateCategory(parent.id, { is_visible: val })} />
                    </div>
                    
                    <div className="pl-6 space-y-1 border-l-2 border-dashed ml-4">
                      {categories.filter(c => c.parent_id === parent.id).map(child => (
                        <div key={child.id} className="flex items-center justify-between p-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-2"><ChevronRight className="w-3 h-3" /> {child.name}</span>
                          <Switch checked={child.is_visible} onCheckedChange={(val) => updateCategory(child.id, { is_visible: val })} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}