import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PricingCategorySectionProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
}

export function PricingCategorySection({ formData, setFormData, categories }: PricingCategorySectionProps) {
  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6 border-l-4 border-l-primary">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Settings2 className="w-4 h-4" /> 1. Giá bán và Phân loại
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá bán lẻ (VND) *</Label>
          <Input 
            type="number" 
            value={formData.price} 
            onChange={(e) => setFormData({...formData, price: e.target.value})} 
            required 
            placeholder="Nhập giá bán..."
            className="h-12 rounded-xl font-bold text-primary text-lg focus:ring-1" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá gốc (Gạch bỏ)</Label>
          <Input 
            type="number" 
            value={formData.original_price} 
            onChange={(e) => setFormData({...formData, original_price: e.target.value})} 
            placeholder="Để trống nếu không có giá cũ..."
            className="h-12 rounded-xl" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Danh mục sản phẩm *</Label>
        <Select 
          value={formData.category_id} 
          onValueChange={(val) => setFormData({...formData, category_id: val})}
        >
          <SelectTrigger className="h-12 rounded-xl border-primary/20 bg-primary/5">
            <SelectValue placeholder="Bấm để chọn danh mục hiển thị..." />
          </SelectTrigger>
          <SelectContent className="max-h-80 rounded-xl">
            {parentCategories.map(parent => (
              <SelectGroup key={parent.id}>
                <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                <SelectItem value={parent.slug}>-- Tất cả {parent.name}</SelectItem>
                {categories.filter(c => c.parent_id === parent.id).map(child => (
                  <SelectItem key={child.id} value={child.slug}>
                    &nbsp;&nbsp;&nbsp;{child.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}