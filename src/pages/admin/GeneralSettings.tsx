import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Loader2, Save, Globe, MapPin, Phone, Mail, Clock, Share2, Truck, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
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
    shipping_policy_summary: "",
    moit_url: "",
    moit_logo_url: ""
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
        shipping_policy_summary: data.shipping_policy_summary || "",
        moit_url: data.moit_url || "",
        moit_logo_url: data.moit_logo_url || ""
      });
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey) {
      toast.error("Vui lòng nhập API Key.");
      return;
    }
    setSavingKey(true);
    try {
      const { error } = await supabase.functions.invoke('set-secret', {
        body: { key: 'GEMINI_API_KEY', value: geminiKey }
      });
      if (error) throw error;
      toast.success("Đã lưu Gemini API Key thành công!");
      setGeminiKey("");
    } catch (e: any) {
      toast.error("Lỗi lưu API Key: " + e.message);
    } finally {
      setSavingKey(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...settings, updated_at: new Date() };
    const { data: existing } = await supabase.from('site_settings').select('id').single();
    const { error } = existing
      ? await supabase.from('site_settings').update(payload).eq('id', existing.id)
      : await supabase.from('site_settings').insert(payload);

    setLoading(false);
    if (error) toast.error("Lỗi khi lưu cấu hình: " + error.message);
    else toast.success("Đã lưu thông tin cấu hình!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Cấu Hình Hệ Thống
        </h1>
        <p className="text-muted-foreground">Quản lý thông tin website và các tích hợp AI.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start overflow-x-auto">
          <TabsTrigger value="general" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Thông tin chung</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Cấu hình AI
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Liên hệ</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Mạng xã hội</TabsTrigger>
        </TabsList>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <TabsContent value="general" className="mt-0 space-y-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                  <Globe className="w-4 h-4" /> Nhận diện thương hiệu
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Logo Website</Label>
                    <ImageUpload value={settings.logo_url} onChange={(url) => setSettings({...settings, logo_url: url as string})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên Website</Label>
                    <Input value={settings.site_name} onChange={(e) => setSettings({...settings, site_name: e.target.value})} className="h-12" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-0 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-charcoal">Google Gemini AI</h3>
                  <p className="text-[10px] text-muted-foreground font-medium italic">Tự động sinh nội dung đánh giá sản phẩm chân thực.</p>
                </div>
              </div>
              
              <div className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5" /> Gemini API Key
                  </Label>
                  <Input 
                    type="password"
                    placeholder="Dán API Key từ Google AI Studio..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Lấy key tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>.
                  </p>
                </div>
                <Button onClick={handleSaveGeminiKey} disabled={savingKey} className="btn-hero h-11 px-8 rounded-xl shadow-gold">
                  {savingKey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu API Key
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-0 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Hotline</Label>
                <Input value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} className="h-12" />
              </div>
            </div>
          </TabsContent>

          <div className="pt-8 mt-8 border-t border-border flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="btn-hero h-12 px-8 shadow-gold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu Cấu Hình
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}