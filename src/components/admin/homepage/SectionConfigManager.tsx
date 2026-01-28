"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Palette, Type, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SECTIONS = [
  { key: 'categories', label: 'Lưới Danh Mục' },
  { key: 'flash_sale', label: 'Flash Sale (Timer)' },
  { key: 'shop_look', label: 'Shop The Look' },
  { key: 'featured', label: 'Sản Phẩm Nổi Bật' },
];

export function SectionConfigManager() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const { data } = await supabase.from('homepage_sections').select('*');
    setConfigs(data || []);
    setLoading(false);
  };

  const handleUpdateField = (key: string, field: string, value: any) => {
    setConfigs(prev => prev.map(c => c.section_key === key ? { ...c, [field]: value } : c));
  };

  const handleUpdateExtra = (key: string, extraField: string, value: any) => {
    setConfigs(prev => prev.map(c => {
      if (c.section_key === key) {
        return { ...c, extra_data: { ...c.extra_data, [extraField]: value } };
      }
      return c;
    }));
  };

  const handleSave = async (sectionKey: string) => {
    const config = configs.find(c => c.section_key === sectionKey);
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({
          title: config.title,
          subtitle: config.subtitle,
          description: config.description,
          title_color: config.title_color,
          content_color: config.content_color,
          extra_data: config.extra_data,
          updated_at: new Date()
        })
        .eq('section_key', sectionKey);

      if (error) throw error;
      toast.success(`Đã lưu cấu hình phần ${sectionKey}`);
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="mt-6">
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-11 w-full justify-start overflow-x-auto no-scrollbar">
          {SECTIONS.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="text-[10px] font-bold uppercase px-6">{s.label}</TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map(s => {
          const config = configs.find(c => c.section_key === s.key);
          if (!config) return null;

          return (
            <TabsContent key={s.key} value={s.key} className="animate-fade-in outline-none">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Cột trái: Văn bản */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                  <div className="flex items-center gap-2 border-b pb-4">
                    <Type className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm uppercase tracking-widest">Nội dung hiển thị</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu đề chính</Label>
                      <Input value={config.title} onChange={e => handleUpdateField(s.key, 'title', e.target.value)} className="h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu đề phụ / Subtitle</Label>
                      <Input value={config.subtitle} onChange={e => handleUpdateField(s.key, 'subtitle', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Mô tả chi tiết</Label>
                      <Textarea value={config.description} onChange={e => handleUpdateField(s.key, 'description', e.target.value)} rows={3} />
                    </div>

                    {s.key === 'flash_sale' && (
                      <div className="pt-4 border-t border-dashed space-y-4">
                         <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-destructive" />
                            <h4 className="text-xs font-bold uppercase">Cài đặt thời gian kết thúc</h4>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold">Ngày & Giờ (ISO Format)</Label>
                            <Input 
                              type="datetime-local" 
                              value={config.extra_data?.end_time ? new Date(config.extra_data.end_time).toISOString().slice(0, 16) : ""}
                              onChange={e => handleUpdateExtra(s.key, 'end_time', new Date(e.target.value).toISOString())} 
                            />
                            <p className="text-[9px] text-muted-foreground italic">Gợi ý: Chọn thời điểm trong tương lai để bộ đếm bắt đầu chạy ngược.</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột phải: Style */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4">
                      <Palette className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm uppercase tracking-widest">Màu sắc & Kiểu dáng</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Màu tiêu đề</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={config.title_color} onChange={e => handleUpdateField(s.key, 'title_color', e.target.value)} className="w-12 h-12 p-1" />
                          <Input value={config.title_color} onChange={e => handleUpdateField(s.key, 'title_color', e.target.value)} className="font-mono text-xs uppercase" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Màu nội dung</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={config.content_color} onChange={e => handleUpdateField(s.key, 'content_color', e.target.value)} className="w-12 h-12 p-1" />
                          <Input value={config.content_color} onChange={e => handleUpdateField(s.key, 'content_color', e.target.value)} className="font-mono text-xs uppercase" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Xem trước nhanh</p>
                      <div className="text-center space-y-1">
                        <h4 style={{ color: config.title_color }} className="text-lg font-bold">{config.title}</h4>
                        <p style={{ color: config.content_color }} className="text-xs">{config.description}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave(s.key)} disabled={saving} className="w-full btn-hero h-14 shadow-gold">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    LƯU THIẾT LẬP PHẦN NÀY
                  </Button>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}