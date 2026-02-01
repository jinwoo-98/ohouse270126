import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, LayoutGrid, CheckCircle, Plus, Trash2, Loader2, Save, Image as ImageIcon, AlertCircle, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconMap: Record<string, any> = { Zap, LayoutGrid, CheckCircle };
const iconOptions = Object.keys(iconMap);

export default function DesignServiceConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    hero_image_url: "",
    steps: [
      { title: "Bước 1: Đăng Ký", desc: "Điền thông tin và yêu cầu thiết kế của bạn.", icon_name: "Zap" },
      { title: "Bước 2: Tư Vấn", desc: "Kiến trúc sư liên hệ, khảo sát và lên ý tưởng sơ bộ.", icon_name: "LayoutGrid" },
      { title: "Bước 3: Hoàn Thiện", desc: "Nhận bản vẽ 3D miễn phí và báo giá chi tiết.", icon_name: "CheckCircle" },
    ] as { title: string; desc: string; icon_name: string }[],
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('design_service_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore 'No rows found' error

      if (data) {
        setConfigId(data.id);
        setFormData({
          hero_image_url: data.hero_image_url || "",
          steps: data.steps || formData.steps,
        });
      }
    } catch (e: any) {
      toast.error("Lỗi tải cấu hình: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        hero_image_url: formData.hero_image_url,
        steps: formData.steps,
        updated_at: new Date().toISOString(),
      };

      if (configId) {
        await supabase.from('design_service_config').update(payload).eq('id', configId);
      } else {
        const { data } = await supabase.from('design_service_config').insert(payload).select().single();
        setConfigId(data.id);
      }
      
      toast.success("Đã lưu cấu hình trang Thiết Kế.");
    } catch (error: any) {
      toast.error("Lỗi lưu cấu hình: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStepChange = (index: number, field: 'title' | 'desc' | 'icon_name', value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link to="/admin"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            Cấu Hình Trang Thiết Kế
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="btn-hero h-11 px-8 shadow-gold">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu Cấu Hình
        </Button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
        
        {/* Hero Image Section */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Ảnh Banner Đầu Trang
          </h3>
          <ImageUpload 
            value={formData.hero_image_url} 
            onChange={(url) => setFormData({...formData, hero_image_url: url as string})} 
          />
          <p className="text-[10px] text-muted-foreground italic">Ảnh nền cho phần giới thiệu dịch vụ thiết kế.</p>
        </div>

        {/* Steps Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Zap className="w-4 h-4" /> Quy Trình 3 Bước
          </h3>
          
          <div className="space-y-8">
            {formData.steps.map((step, index) => {
              const Icon = iconMap[step.icon_name] || Zap;
              return (
                <div key={index} className="p-5 bg-secondary/30 rounded-2xl border border-border/50 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-charcoal">Bước {index + 1}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu đề</Label>
                      <Input 
                        value={step.title} 
                        onChange={e => handleStepChange(index, 'title', e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Icon</Label>
                      <Select value={step.icon_name} onValueChange={val => handleStepChange(index, 'icon_name', val)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map(iconName => {
                            const IconOption = iconMap[iconName];
                            return (
                              <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                  <IconOption className="w-4 h-4" /> {iconName}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Mô tả ngắn</Label>
                    <Textarea 
                      value={step.desc} 
                      onChange={e => handleStepChange(index, 'desc', e.target.value)}
                      rows={2}
                      className="rounded-xl resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={saving} className="btn-hero h-12 px-8 shadow-gold">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu Cấu Hình
        </Button>
      </div>
    </div>
  );
}