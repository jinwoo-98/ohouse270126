import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Palette, Layout } from "lucide-react";

export default function ThemeSettings() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    primary_color: "#b08d55",
    secondary_color: "#f5f5f5",
    radius: "0.5rem"
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase.from('theme_config').select('*').single();
    if (data) {
      setConfig({
        primary_color: data.primary_color || "#b08d55",
        secondary_color: data.secondary_color || "#f5f5f5",
        radius: data.radius || "0.5rem"
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('theme_config').select('id').single();
      
      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('theme_config')
          .update(config)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('theme_config').insert(config);
        error = insertError;
      }

      if (error) throw error;
      
      toast.success("Đã lưu cấu hình giao diện thành công!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          Cấu Hình Giao Diện
        </h1>
        <p className="text-muted-foreground">Tùy chỉnh màu sắc và phong cách thương hiệu của website.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Màu chủ đạo (Primary)</Label>
            <div className="flex gap-3">
              <div 
                className="w-12 h-12 rounded-xl border border-border shrink-0 shadow-inner"
                style={{ backgroundColor: config.primary_color }}
              />
              <div className="flex-1 space-y-2">
                <Input 
                  type="text" 
                  value={config.primary_color}
                  onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                  className="font-mono uppercase h-12"
                  placeholder="#000000"
                />
                <input 
                  type="color" 
                  className="w-full h-2 p-0 border-none cursor-pointer"
                  value={config.primary_color}
                  onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Dùng cho nút bấm, giá tiền và các thành phần nổi bật.</p>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Màu nền phụ (Secondary)</Label>
            <div className="flex gap-3">
              <div 
                className="w-12 h-12 rounded-xl border border-border shrink-0 shadow-inner"
                style={{ backgroundColor: config.secondary_color }}
              />
              <div className="flex-1 space-y-2">
                <Input 
                  type="text" 
                  value={config.secondary_color}
                  onChange={(e) => setConfig({...config, secondary_color: e.target.value})}
                  className="font-mono uppercase h-12"
                  placeholder="#F5F5F5"
                />
                <input 
                  type="color" 
                  className="w-full h-2 p-0 border-none cursor-pointer"
                  value={config.secondary_color}
                  onChange={(e) => setConfig({...config, secondary_color: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Dùng cho các vùng nền nhẹ nhàng, banner phụ.</p>
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-border/50">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layout className="w-4 h-4" /> Độ bo góc (Border Radius)
          </Label>
          <Select 
            value={config.radius} 
            onValueChange={(val) => setConfig({...config, radius: val})}
          >
            <SelectTrigger className="h-12 rounded-xl border-border">
              <SelectValue placeholder="Chọn độ bo góc" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="0px">Vuông vắn (0px)</SelectItem>
              <SelectItem value="0.3rem">Bo nhẹ (0.3rem)</SelectItem>
              <SelectItem value="0.5rem">Tiêu chuẩn (0.5rem)</SelectItem>
              <SelectItem value="0.75rem">Bo nhiều (0.75rem)</SelectItem>
              <SelectItem value="1rem">Bo tròn (1rem)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground italic">Ảnh hưởng đến toàn bộ nút bấm và khung thẻ sản phẩm.</p>
        </div>

        <div className="pt-6 border-t border-border/50">
          <Button onClick={handleSave} disabled={loading} className="btn-hero w-full md:w-auto h-12 px-10 shadow-gold">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu Thay Đổi Giao Diện
          </Button>
        </div>
      </div>
    </div>
  );
}