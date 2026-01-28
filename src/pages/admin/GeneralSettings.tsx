import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "",
    logo_url: "",
    phone: "",
    email: "",
    address: ""
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
        address: data.address || ""
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').single();
      
      if (existing) {
        await supabase.from('site_settings').update(settings).eq('id', existing.id);
      } else {
        await supabase.from('site_settings').insert(settings);
      }
      
      toast.success("Đã lưu thông tin website!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Cấu Hình Chung</h1>
        <p className="text-muted-foreground">Thông tin cơ bản, logo và liên hệ của website.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="space-y-2">
          <Label>Logo Website</Label>
          <div className="max-w-xs">
            <ImageUpload 
              value={settings.logo_url} 
              onChange={(url) => setSettings({...settings, logo_url: url})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Tên Website</Label>
            <Input 
              value={settings.site_name} 
              onChange={(e) => setSettings({...settings, site_name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>Hotline</Label>
            <Input 
              value={settings.phone} 
              onChange={(e) => setSettings({...settings, phone: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email liên hệ</Label>
          <Input 
            value={settings.email} 
            onChange={(e) => setSettings({...settings, email: e.target.value})} 
          />
        </div>

        <div className="space-y-2">
          <Label>Địa chỉ</Label>
          <Input 
            value={settings.address} 
            onChange={(e) => setSettings({...settings, address: e.target.value})} 
          />
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="btn-hero">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu Thông Tin
          </Button>
        </div>
      </div>
    </div>
  );
}