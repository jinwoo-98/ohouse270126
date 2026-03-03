import { Layers, TrendingUp, Star, ShoppingBag, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductStatusSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ProductStatusSection({ formData, setFormData }: ProductStatusSectionProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Layers className="w-4 h-4" /> Trạng thái & Badge
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-[10px] font-bold uppercase">Sản phẩm Mới</span>
            <Switch checked={formData.is_new} onCheckedChange={(val) => setFormData({...formData, is_new: val})} />
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-[10px] font-bold uppercase">Flash Sale</span>
            <Switch checked={formData.is_sale} onCheckedChange={(val) => setFormData({...formData, is_sale: val})} />
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-[10px] font-bold uppercase">Nổi Bật</span>
            <Switch checked={formData.is_featured} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-dashed">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Chỉ số ảo (Marketing)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Đã bán
            </Label>
            <Input type="number" value={formData.fake_sold} onChange={e=>setFormData({...formData, fake_sold: e.target.value})} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3" /> Đánh giá
            </Label>
            <Input type="number" value={formData.fake_review_count} onChange={e=>setFormData({...formData, fake_review_count: e.target.value})} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" /> Điểm sao
            </Label>
            <Input type="number" step="0.1" value={formData.fake_rating} onChange={e=>setFormData({...formData, fake_rating: e.target.value})} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Thứ tự
            </Label>
            <Input type="number" value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}