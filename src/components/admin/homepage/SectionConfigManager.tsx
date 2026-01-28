"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Palette, Type, Clock, Settings2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
          subtitle_color: config.subtitle_color,
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
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start overflow-x-auto no-scrollbar shadow-sm">
          {SECTIONS.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="text-[10px] font-bold uppercase px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map(s => {
          const config = configs.find(c => c.section_key === s.key);
          if (!config) return null;

          return (
            <TabsContent key={s.key} value={s.key} className="animate-fade-in outline-none">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* TEXT CONTENT CARD */}
                  <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Type className="w-5 h-5" /></div>
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest">Tiêu đề & Nội dung</h3>
                        <p className="text-[10px] text-muted-foreground font-medium italic">Văn bản hiển thị của mục này</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu đề chính (Title)</Label>
                        <Input value={config.title || ""} onChange={e => handleUpdateField(s.key, 'title', e.target.value)} className="h-12 font-bold text-lg rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu đề phụ (Subtitle)</Label>
                        <Input value={config.subtitle || ""} onChange={e => handleUpdateField(s.key, 'subtitle', e.target.value)} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Đoạn mô tả ngắn</Label>
                        <Textarea value={config.description || ""} onChange={e => handleUpdateField(s.key, 'description', e.target.value)} rows={3} className="rounded-xl resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* FLASH SALE SPECIFIC SETUP */}
                  {s.key === 'flash_sale' && (
                    <div className="bg-charcoal p-8 rounded-3xl border shadow-elevated space-y-6 text-cream">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary"><Clock className="w-5 h-5" /></div>
                        <div>
                          <h3 className="font-bold text-sm uppercase tracking-widest">Cấu hình Đếm Ngược</h3>
                          <p className="text-[10px] text-taupe font-medium">Thiết lập thời hạn kết thúc Flash Sale</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block">Hạn chót Flash Sale</Label>
                          <Input 
                            type="datetime-local" 
                            className="h-12 bg-white/10 border-white/20 text-cream focus:border-primary rounded-xl"
                            value={config.extra_data?.end_time ? new Date(config.extra_data.end_time).toISOString().slice(0, 16) : ""}
                            onChange={e => handleUpdateExtra(s.key, 'end_time', new Date(e.target.value).toISOString())} 
                          />
                          <p className="text-[10px] italic text-taupe">Lưu ý: Bộ đếm ngược sẽ tự động xuất hiện ngoài trang chủ nếu thời gian còn hiệu lực.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* STYLE CARD */}
                  <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Palette className="w-5 h-5" /></div>
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest">Màu sắc thương hiệu</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Tùy chỉnh màu sắc riêng cho phần này</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Màu phụ (Subtitle)</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={config.subtitle_color || "#b08d55"} onChange={e => handleUpdateField(s.key, 'subtitle_color', e.target.value)} className="w-12 h-12 p-1 rounded-lg shrink-0" />
                          <Input value={config.subtitle_color || "#b08d55"} onChange={e => handleUpdateField(s.key, 'subtitle_color', e.target.value)} className="font-mono text-[10px] uppercase h-12 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Màu chính (Title)</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={config.title_color || "#1a1a1a"} onChange={e => handleUpdateField(s.key, 'title_color', e.target.value)} className="w-12 h-12 p-1 rounded-lg shrink-0" />
                          <Input value={config.title_color || "#1a1a1a"} onChange={e => handleUpdateField(s.key, 'title_color', e.target.value)} className="font-mono text-[10px] uppercase h-12 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Màu mô tả (Content)</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={config.content_color || "#666666"} onChange={e => handleUpdateField(s.key, 'content_color', e.target.value)} className="w-12 h-12 p-1 rounded-lg shrink-0" />
                          <Input value={config.content_color || "#666666"} onChange={e => handleUpdateField(s.key, 'content_color', e.target.value)} className="font-mono text-[10px] uppercase h-12 rounded-xl" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-secondary/20 rounded-2xl border border-dashed border-border/60">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bản xem trước văn bản</span>
                      </div>
                      <div className="text-center space-y-1">
                        {config.subtitle && (
                          <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: config.subtitle_color || "#b08d55" }}>
                            {config.subtitle}
                          </p>
                        )}
                        <h4 style={{ color: config.title_color || "#1a1a1a" }} className="text-xl font-bold leading-tight">{config.title || "Tiêu đề mẫu"}</h4>
                        <p style={{ color: config.content_color || "#666666" }} className="text-xs mt-2 line-clamp-2 px-4">{config.description || "Nội dung mô tả mẫu sẽ xuất hiện tại đây..."}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave(s.key)} disabled={saving} className="w-full btn-hero h-14 shadow-gold rounded-2xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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