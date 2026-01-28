import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  ShoppingBag, 
  Star, 
  Layers, 
  Zap, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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
import { mainCategories } from "@/constants/header-data";

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [targetCategory, setTargetCategory] = useState("all");
  const [stats, setStats] = useState({
    fake_sold: "",
    fake_review_count: "",
    fake_rating: "5.0",
    display_order: ""
  });

  const handleBulkUpdate = async () => {
    if (!confirm("Hành động này sẽ cập nhật số liệu cho TẤT CẢ sản phẩm đã chọn. Bạn chắc chắn chứ?")) return;
    
    setLoading(true);
    try {
      let query = supabase.from('products').update({
        ...(stats.fake_sold && { fake_sold: parseInt(stats.fake_sold) }),
        ...(stats.fake_review_count && { fake_review_count: parseInt(stats.fake_review_count) }),
        ...(stats.fake_rating && { fake_rating: parseFloat(stats.fake_rating) }),
        ...(stats.display_order && { display_order: parseInt(stats.display_order) }),
        updated_at: new Date()
      });

      if (targetCategory !== "all") {
        query = query.eq('category_id', targetCategory);
      } else {
        // Nếu chọn tất cả, ta cần giới hạn phạm vi hoặc xác nhận kỹ
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy filter to allow update
      }

      const { error, count } = await query;
      if (error) throw error;

      toast.success("Đã cập nhật số liệu marketing hàng loạt thành công!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Công Cụ Marketing Hàng Loạt
        </h1>
        <p className="text-muted-foreground text-sm">Thiết lập lượt bán, đánh giá ảo và thứ tự hiển thị cho nhóm sản phẩm.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Bước 1: Chọn đối tượng */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm h-full">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 1. Chọn đối tượng
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Danh mục sản phẩm</Label>
                <Select value={targetCategory} onValueChange={setTargetCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                    {mainCategories.filter(c => c.dropdownKey).map(cat => (
                      <SelectItem key={cat.dropdownKey} value={cat.dropdownKey!}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Lưu ý: Các chỉ số sẽ được áp dụng giống hệt nhau cho toàn bộ sản phẩm trong nhóm này.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bước 2: Cấu hình chỉ số */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 2. Thiết lập số liệu (để trống nếu không đổi)
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> Lượt bán ảo
                </Label>
                <Input 
                  type="number" 
                  placeholder="Ví dụ: 150" 
                  value={stats.fake_sold}
                  onChange={(e) => setStats({...stats, fake_sold: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" /> Số lượng đánh giá
                </Label>
                <Input 
                  type="number" 
                  placeholder="Ví dụ: 45" 
                  value={stats.fake_review_count}
                  onChange={(e) => setStats({...stats, fake_review_count: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Điểm đánh giá (1-5)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  max="5"
                  value={stats.fake_rating}
                  onChange={(e) => setStats({...stats, fake_rating: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Thứ tự hiển thị</Label>
                <Input 
                  type="number" 
                  placeholder="Mặc định: 1000" 
                  value={stats.display_order}
                  onChange={(e) => setStats({...stats, display_order: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="mt-10 pt-6 border-t">
              <Button 
                onClick={handleBulkUpdate} 
                disabled={loading} 
                className="w-full btn-hero h-14 shadow-gold rounded-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                Áp Dụng Cho {targetCategory === 'all' ? 'Tất Cả' : 'Danh Mục'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}