import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Loader2, Save, Globe, MapPin, Phone, Mail, Clock, Share2, Truck, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "",
    logo_url: "",
    phone: "",
    email: "",
    address: "",
    facebook_url: "",
    zalo_url: "",
    youtube_url: "",
    tiktok_url: "",
    working_hours: "",
    // map_iframe_url đã bị loại bỏ khỏi form này
    shipping_policy_summary: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').single();
    if (data) {
      setSettings({
        site_name: data.site_name || "",
        logo_url: data.logo_url || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        facebook_url: data.facebook_url || "",
        zalo_url: data.zalo_url || "",
        youtube_url: data.youtube_url || "",
        tiktok_url: data.tiktok_url || "",
        working_hours: data.working_hours || "",
        shipping_policy_summary: data.shipping_policy_summary || ""
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').single();
      
      const payload = {
        ...settings,
        updated_at: new Date()
      };

      if (existing) {
        await supabase.from('site_settings').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('site_settings').insert(payload);
      }
      
      toast.success("Đã lưu thông tin cấu hình!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Cấu Hình Chung & Liên Hệ
        </h1>
        <p className="text-muted-foreground">Quản lý thông tin hiển thị trên Header, Footer và trang Liên hệ.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start overflow-x-auto">
          <TabsTrigger value="general" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Thông tin chung</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Liên hệ & Địa chỉ</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Mạng xã hội</TabsTrigger>
          <TabsTrigger value="shipping" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Chính sách SP</TabsTrigger>
        </TabsList>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <TabsContent value="general" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                <Globe className="w-4 h-4" /> Nhận diện thương hiệu
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>Logo Website</Label>
                  <ImageUpload 
                    value={settings.logo_url} 
                    onChange={(url) => setSettings({...settings, logo_url: url as string})} 
                  />
                  <p className="text-[10px] text-muted-foreground italic">Khuyên dùng ảnh PNG trong suốt, kích thước tối thiểu 200x60px.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tên Website (Tiêu đề trang)</Label>
                    <Input 
                      value={settings.site_name} 
                      onChange={(e) => setSettings({...settings, site_name: e.target.value})} 
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-0 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
              <MapPin className="w-4 h-4" /> Thông tin liên hệ
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="w-3 h-3" /> Hotline</Label>
                <Input 
                  value={settings.phone} 
                  onChange={(e) => setSettings({...settings, phone: e.target.value})} 
                  className="h-12 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email hỗ trợ</Label>
                <Input 
                  value={settings.email} 
                  onChange={(e) => setSettings({...settings, email: e.target.value})} 
                  className="h-12 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock className="w-3 h-3" /> Giờ làm việc</Label>
              <Input 
                value={settings.working_hours} 
                onChange={(e) => setSettings({...settings, working_hours: e.target.value})} 
                placeholder="VD: 8:00 - 21:00 (Tất cả các ngày)"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Địa chỉ trụ sở / Showroom chính (Hiển thị Footer)</Label>
              <Input 
                value={settings.address} 
                onChange={(e) => setSettings({...settings, address: e.target.value})} 
                className="h-12"
              />
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-1 shrink-0" />
              <p>
                Để quản lý danh sách Showroom chi tiết (bao gồm bản đồ nhúng), vui lòng truy cập mục <Link to="/admin/showrooms" className="text-primary font-bold underline">Quản lý Showroom</Link>.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-0 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
              <Share2 className="w-4 h-4" /> Liên kết mạng xã hội
            </h3>

            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0"><Share2 className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <Label>Facebook Fanpage</Label>
                  <Input value={settings.facebook_url} onChange={(e) => setSettings({...settings, facebook_url: e.target.value})} placeholder="https://facebook.com/..." />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0"><Share2 className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <Label>Zalo OA</Label>
                  <Input value={settings.zalo_url} onChange={(e) => setSettings({...settings, zalo_url: e.target.value})} placeholder="https://zalo.me/..." />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0"><Share2 className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <Label>YouTube Channel</Label>
                  <Input value={settings.youtube_url} onChange={(e) => setSettings({...settings, youtube_url: e.target.value})} placeholder="https://youtube.com/..." />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white shrink-0"><Share2 className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <Label>TikTok Channel</Label>
                  <Input value={settings.tiktok_url} onChange={(e) => setSettings({...settings, tiktok_url: e.target.value})} placeholder="https://tiktok.com/..." />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-0 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
              <Truck className="w-4 h-4" /> Tóm tắt Vận chuyển & Đổi trả
            </h3>
            <div className="space-y-2">
              <Label>Nội dung hiển thị cuối trang chi tiết sản phẩm</Label>
              <RichTextEditor 
                value={settings.shipping_policy_summary} 
                onChange={(val) => setSettings({...settings, shipping_policy_summary: val})}
                placeholder="Nhập tóm tắt chính sách vận chuyển, đổi trả..."
              />
              <p className="text-[10px] text-muted-foreground italic">Nội dung này sẽ hiển thị ở cuối mỗi trang chi tiết sản phẩm.</p>
            </div>
          </TabsContent>

          <div className="pt-8 mt-8 border-t border-border flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="btn-hero h-12 px-8 shadow-gold">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu Cấu Hình
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}