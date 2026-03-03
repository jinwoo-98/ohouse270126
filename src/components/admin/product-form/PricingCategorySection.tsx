import { Layers, Settings2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatNumberWithDots, parseNumberFromDots } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PricingCategorySectionProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  hasVariants: boolean;
}

export function PricingCategorySection({ formData, setFormData, categories, hasVariants }: PricingCategorySectionProps) {
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  
  const parents = categories.filter(c => !c.parent_id);
  const children = categories.filter(c => c.parent_id === selectedParentId);

  useEffect(() => {
    if (formData.category_id) {
      const current = categories.find(c => c.slug === formData.category_id);
      if (current?.parent_id) setSelectedParentId(current.parent_id);
      else if (current) setSelectedParentId(current.id);
    }
  }, [formData.category_id, categories]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Layers className="w-4 h-4" /> 2. Danh mục & Giá bán
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Danh mục chính</Label>
          <Select value={selectedParentId} onValueChange={setSelectedParentId}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục cha..." /></SelectTrigger>
            <SelectContent>
              {parents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {selectedParentId && children.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Danh mục con</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(val) => setFormData({...formData, category_id: val})}
            >
              <SelectTrigger className="h-11 rounded-xl border-primary/20 bg-primary/5">
                <SelectValue placeholder="Chọn danh mục con..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={parents.find(p => p.id === selectedParentId)?.slug}>-- Tất cả {parents.find(p => p.id === selectedParentId)?.name} --</SelectItem>
                {children.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!hasVariants ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-dashed animate-fade-in">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá bán lẻ (VND) *</Label>
            <Input 
              type="text" 
              value={formatNumberWithDots(formData.price)} 
              onChange={(e) => setFormData({...formData, price: parseNumberFromDots(e.target.value)})} 
              className="h-12 rounded-xl font-bold text-primary text-lg" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá gốc (Gạch bỏ)</Label>
            <Input 
              type="text" 
              value={formatNumberWithDots(formData.original_price)} 
              onChange={(e) => setFormData({...formData, original_price: parseNumberFromDots(e.target.value)})} 
              className="h-12 rounded-xl" 
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3 animate-fade-in">
          <Settings2 className="w-5 h-5 text-primary" />
          <p className="text-xs font-medium text-charcoal">
            Đang sử dụng <b>Phân loại sản phẩm</b>. Giá hiển thị trên web sẽ lấy từ biến thể đầu tiên trong bảng phân loại bên dưới.
          </p>
        </div>
      )}
    </div>
  );
}