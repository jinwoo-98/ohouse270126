"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Loader2, Save, Search, Share2, Code, Globe } from "lucide-react";

export default function SeoSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    meta_title: "",
    meta_description: "",
    og_image_url: "",
    structured_data: "",
    favicon_url: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.from('seo_settings').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          og_image_url: data.og_image_url || "",
          structured_data: data.structured_data ? JSON.stringify(data.structured_data, null, 2) : "",
          favicon_url: data.favicon_url || ""
        });
      }
    } catch (e: any) {
      console.error("Error fetching SEO settings:", e);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading("Đang lưu cấu hình SEO...");
    
    let structuredDataJson = null;
    if (settings.structured_data) {
      try {
        structuredDataJson = JSON.parse(settings.structured_data);
      } catch (e) {
        toast.error("Lỗi cú pháp JSON trong Structured Data. Vui lòng kiểm tra lại.", { id: toastId });
        setLoading(false);
        return;
      }
    }

    const payload = {
      meta_title: settings.meta_title,
      meta_description: settings.meta_description,
      og_image_url: settings.og_image_url,
      structured_data: structuredDataJson,
      favicon_url: settings.favicon_url
    };

    try {
      // Luôn update vào ID 1 vì migration đã tạo sẵn
      const { error } = await supabase.from('seo_settings').update(payload).eq('id', 1);
      if (error) throw error;
      toast.success("Đã lưu cấu hình SEO thành công!", { id: toastId });
    } catch (e: any) {
      toast.error("Lỗi khi lưu: " + e.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Cấu Hình SEO Toàn Cục
        </h1>
        <p className="text-muted-foreground">Quản lý cách website của bạn hiển thị trên Google và mạng xã hội.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-8">
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-4">
            <Globe className="w-4 h-4" /> Meta Tags Mặc Định
          </h3>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Meta Title (Tiêu đề trang)</Label>
              <Input 
                value={settings.meta_title} 
                onChange={(e) => setSettings({...settings, meta_title: e.target.value})} 
                placeholder="OHOUSE - Nội Thất Cao Cấp | Sang Trọng & Hiện Đại" 
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground italic">Hiển thị trên tab trình duyệt và kết quả tìm kiếm. Độ dài tối ưu: 50-60 ký tự.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Meta Description (Mô tả trang)</Label>
              <Textarea 
                value={settings.meta_description} 
                onChange={(e) => setSettings({...settings, meta_description: e.target.value})} 
                placeholder="Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng..." 
                className="rounded-xl min-h-[100px] resize-none"
              />
              <p className="text-[10px] text-muted-foreground italic">Đoạn mô tả ngắn hiển thị dưới tiêu đề trên Google. Độ dài tối ưu: 150-160 ký tự.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-dashed space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-4">
            <Share2 className="w-4 h-4" /> Chia Sẻ Mạng Xã Hội (OG Image)
          </h3>
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Ảnh hiển thị khi chia sẻ link</Label>
            <ImageUpload value={settings.og_image_url} onChange={(url) => setSettings({...settings, og_image_url: url as string})} />
            <p className="text-[10px] text-muted-foreground italic">Ảnh đại diện cho website khi chia sẻ lên Facebook, Zalo. Tỷ lệ khuyên dùng: 1200x630px.</p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-dashed space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-4">
            <Code className="w-4 h-4" /> Dữ Liệu Cấu Trúc (JSON-LD)
          </h3>
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Organization Schema</Label>
            <Textarea 
              value={settings.structured_data} 
              onChange={(e) => setSettings({...settings, structured_data: e.target.value})} 
              rows={8}
              className="font-mono text-xs rounded-xl bg-secondary/20 border-none"
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "OHOUSE",\n  "url": "https://ohouse.vn",\n  "logo": "https://ohouse.vn/logo.png"\n}`}
            />
            <p className="text-[10px] text-muted-foreground italic">Cung cấp thông tin doanh nghiệp cho Google. Chỉ dành cho người dùng có kiến thức kỹ thuật.</p>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="btn-hero h-14 px-12 shadow-gold rounded-2xl">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            LƯU CẤU HÌNH SEO
          </Button>
        </div>
      </div>
    </div>
  );
}