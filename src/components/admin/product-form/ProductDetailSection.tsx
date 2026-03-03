import { Info, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProductDetailSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  availableAttributes: any[];
  productAttrs: Record<string, any>;
  handleAttributeChange: (attrId: string, value: any, isMulti: boolean) => void;
}

export function ProductDetailSection({ 
  formData, 
  setFormData, 
  availableAttributes, 
  productAttrs, 
  handleAttributeChange 
}: ProductDetailSectionProps) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Info className="w-4 h-4" /> 1. Thông tin & Thuộc tính
      </h3>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tên sản phẩm *</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Ví dụ: Sofa da Ý cao cấp"
          className="h-12 rounded-xl text-lg font-bold"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
          <ListFilter className="w-3 h-3" /> Thuộc tính bộ lọc
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAttributes.map(attr => (
            <div key={attr.id} className="p-4 bg-secondary/30 rounded-2xl border border-border/50 space-y-3">
              <p className="text-[10px] font-bold uppercase text-charcoal">{attr.name}</p>
              
              {attr.type === 'single' ? (
                <Select 
                  value={productAttrs[attr.id]?.[0] || ""} 
                  onValueChange={(val) => handleAttributeChange(attr.id, val, false)}
                >
                  <SelectTrigger className="h-9 bg-white rounded-lg text-xs">
                    <SelectValue placeholder={`Chọn ${attr.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {attr.options?.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <ScrollArea className="h-24 pr-2">
                  <div className="grid grid-cols-1 gap-2">
                    {attr.options?.map((opt: string) => (
                      <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-white/50 p-1 rounded transition-colors">
                        <Checkbox 
                          checked={productAttrs[attr.id]?.includes(opt)}
                          onCheckedChange={() => handleAttributeChange(attr.id, opt, true)}
                        />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}