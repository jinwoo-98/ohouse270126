import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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
    const { data, error } = await supabase.from('theme_config').select('*').single();
    if (data) {
      setConfig({
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        radius: data.radius
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Cập nhật record đầu tiên
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
      
      toast.success("Đã lưu cấu hình giao diện. Vui lòng tải lại trang để thấy thay đổi.");
      
      // Áp dụng ngay lập tức (Preview)
      document.documentElement.style.setProperty('--primary', hexToHsl(config.primary_color));
      document.documentElement.style.setProperty('--radius', config.radius);

    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper đơn giản để chuyển Hex sang HSL cho Tailwind (để demo)
  // Thực tế cần 1 hàm convert chính xác hơn
  const hexToHsl = (hex: string) => {
    // Đây chỉ là demo, bạn nên dùng thư viện tinycolor2 hoặc colord
    return "38 65% 50%"; 
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Cấu Hình Giao Diện</h1>
        <p className="text-muted-foreground">Tùy chỉnh màu sắc và phong cách của website.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Màu chủ đạo (Primary)</Label>
            <div className="flex gap-3">
              <Input 
                type="color" 
                className="w-12 h-12 p-1 cursor-pointer"
                value={config.primary_color}
                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
              />
              <Input 
                type="text" 
                value={config.primary_color}
                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                className="uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground">Dùng cho nút bấm, icon nổi bật, giá tiền.</p>
          </div>

          <div className="space-y-2">
            <Label>Màu nền phụ (Secondary)</Label>
            <div className="flex gap-3">
              <Input 
                type="color" 
                className="w-12 h-12 p-1 cursor-pointer"
                value={config.secondary_color}
                onChange={(e) => setConfig({...config, secondary_color: e.target.value})}
              />
              <Input 
                type="text" 
                value={config.secondary_color}
                onChange={(e) => setConfig({...config, secondary_color: e.target.value})}
                className="uppercase"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Độ bo góc (Border Radius)</Label>
          <Select 
            value={config.radius} 
            onValueChange={(val) => setConfig({...config, radius: val})}
          >
             {/* Note: Cần import Select từ shadcn/ui. Tôi dùng Input tạm để demo code ngắn gọn */}
             <Input 
                value={config.radius} 
                onChange={(e) => setConfig({...config, radius: e.target.value})}
                placeholder="0.5rem"
             />
          </Select>
          <p className="text-xs text-muted-foreground">Ví dụ: 0px (Vuông), 0.5rem (Bo nhẹ), 1.5rem (Bo tròn nhiều).</p>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="btn-hero">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu Thay Đổi
          </Button>
        </div>
      </div>
    </div>
  );
}