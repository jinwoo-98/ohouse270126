import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, LayoutGrid, CheckCircle, Plus, Trash2, Loader2, Save, Image as ImageIcon, AlertCircle, ArrowLeft, ListFilter, DollarSign, DraftingCompass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionManager } from "@/components/admin/OptionManager";

const iconMap: Record<string, any> = { Zap, LayoutGrid, CheckCircle, DollarSign, DraftingCompass };
const iconOptions = Object.keys(iconMap);

interface Step {
  title: string;
  desc: string;
  icon_name: string;
}

interface Option {
  id: string; // Added ID for DND
  label: string;
  value: string;
}

// Helper to ensure options have unique IDs for DND
const ensureIds = (options: any[]): Option[] => {
  return options.map(opt => ({
    ...opt,
    id: opt.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
  }));
};

// Define the new 4-step default configuration
const DEFAULT_STEPS: Step[] = [
  { title: "Bước 1: Đăng Ký & Tiếp Nhận", desc: "Điền thông tin và yêu cầu thiết kế của bạn. Chuyên viên OHOUSE tiếp nhận.", icon_name: "Zap" },
  { title: "Bước 2: Tư Vấn & Báo Giá Sơ Bộ", desc: "KTS tư vấn, lên ý tưởng sơ bộ và báo giá ước tính theo ngân sách.", icon_name: "DollarSign" },
  { title: "Bước 3: Thiết Kế 3D Chi Tiết", desc: "Tiến hành thiết kế 3D, bản vẽ kỹ thuật chi tiết sau khi chốt ngân sách.", icon_name: "DraftingCompass" },
  { title: "Bước 4: Hoàn Thiện & Thi Công", desc: "Bàn giao hồ sơ thiết kế và tiến hành thi công (nếu có yêu cầu).", icon_name: "CheckCircle" },
];

export default function DesignServiceConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    hero_image_url: "",
    steps: DEFAULT_STEPS as Step[],
    room_options: [] as Option[],
    budget_options: [] as Option[],
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

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfigId(data.id);
        setFormData({
          hero_image_url: data.hero_image_url || "",
          // Use data if available, otherwise use the new default steps
          steps: data.steps || DEFAULT_STEPS,
          // Ensure IDs are present for DND
          room_options: ensureIds(data.room_options || []),
          budget_options: ensureIds(data.budget_options || []),
        });
      } else {
         // If no data exists (after deletion), use the new default steps
         setFormData(prev => ({
            ...prev,
            steps: DEFAULT_STEPS,
            room_options: ensureIds(prev.room_options),
            budget_options: ensureIds(prev.budget_options),
         }));
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
      // Remove temporary DND IDs before saving to DB
      const cleanOptions = (options: Option[]) => options.map(({ id, ...rest }) => rest);

      const payload = {
        hero_image_url: formData.hero_image_url,
        steps: formData.steps,
        room_options: cleanOptions(formData.room_options),
        budget_options: cleanOptions(formData.budget_options),
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
    <div className="max-w-6xl mx-auto pb-20">
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                <Zap className="w-4 h-4" /> Quy Trình {formData.steps.length} Bước
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
        </div>
        
        {/* Cột 2: Form Options Manager */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <ListFilter className="w-4 h-4" /> Tùy chọn Form Đăng Ký
            </h3>
            
            <OptionManager 
              title="Không gian cần thiết kế"
              options={formData.room_options}
              onChange={(options) => setFormData({...formData, room_options: options})}
            />
            
            <div className="pt-4 border-t border-border/50">
              <OptionManager 
                title="Ngân sách dự kiến"
                options={formData.budget_options}
                onChange={(options) => setFormData({...formData, budget_options: options})}
              />
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={saving} className="w-full btn-hero h-12 px-8 shadow-gold">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu Cấu Hình
          </Button>
        </div>
      </div>
    </div>
  );
}