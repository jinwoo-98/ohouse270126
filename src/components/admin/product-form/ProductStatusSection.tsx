import { Layers } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProductStatusSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ProductStatusSection({ formData, setFormData }: ProductStatusSectionProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Layers className="w-4 h-4" /> Trạng thái & Badge
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
          <span className="text-xs font-bold uppercase">Sản phẩm Mới</span>
          <Switch checked={formData.is_new} onCheckedChange={(val) => setFormData({...formData, is_new: val})} />
        </div>
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
          <span className="text-xs font-bold uppercase">Flash Sale</span>
          <Switch checked={formData.is_sale} onCheckedChange={(val) => setFormData({...formData, is_sale: val})} />
        </div>
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
          <span className="text-xs font-bold uppercase">Nổi Bật</span>
          <Switch checked={formData.is_featured} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
        </div>
      </div>
    </div>
  );
}