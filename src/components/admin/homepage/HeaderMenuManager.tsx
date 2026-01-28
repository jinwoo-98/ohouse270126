"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Layers, ChevronRight, ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function HeaderMenuManager() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
  };

  const toggleFlag = async (id: string, field: string, current: boolean) => {
    try {
      await supabase.from('categories').update({ [field]: !current }).eq('id', id);
      setCategories(categories.map(c => c.id === id ? { ...c, [field]: !current } : c));
      toast.success("Đã cập nhật");
    } catch (e) { toast.error("Lỗi cập nhật"); }
  };

  const parentCategories = (location: string) => categories.filter(c => !c.parent_id && c.menu_location === location);

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-6">
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Danh mục hiển thị Trang Chủ</h3>
        </div>
        <div className="space-y-3">
          {categories.filter(c => !c.parent_id).map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border">
                  {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 m-auto mt-3 text-gray-300" />}
                </div>
                <span className="text-sm font-bold">{cat.name}</span>
              </div>
              <Switch checked={cat.show_on_home} onCheckedChange={() => toggleFlag(cat.id, 'show_on_home', cat.show_on_home)} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Quản lý Menu Header</h3>
        </div>
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {['secondary', 'main'].map(loc => (
            <div key={loc} className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase text-primary bg-primary/5 p-2 rounded-lg">
                {loc === 'main' ? 'Hàng 4: Menu Sản Phẩm' : 'Hàng 3: Dịch Vụ & Hỗ Trợ'}
              </h4>
              <div className="space-y-2">
                {parentCategories(loc).map(parent => (
                  <div key={parent.id} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{parent.name}</span>
                        {parent.is_highlight && <Badge className="bg-red-500 text-[8px] h-4 uppercase">Sale</Badge>}
                      </div>
                      <Switch checked={parent.is_visible} onCheckedChange={() => toggleFlag(parent.id, 'is_visible', parent.is_visible)} />
                    </div>
                    <div className="pl-6 space-y-1 border-l-2 border-dashed ml-4">
                      {categories.filter(c => c.parent_id === parent.id).map(child => (
                        <div key={child.id} className="flex items-center justify-between p-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-2"><ChevronRight className="w-3 h-3" /> {child.name}</span>
                          <Switch checked={child.is_visible} onCheckedChange={() => toggleFlag(child.id, 'is_visible', child.is_visible)} />
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