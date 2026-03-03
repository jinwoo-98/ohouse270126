import { Info, ListFilter, ChevronDown, Check, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  
  const handleCopySlug = () => {
    if (!formData.slug) return;
    navigator.clipboard.writeText(formData.slug);
    toast.success("Đã sao chép đường dẫn!");
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Info className="w-4 h-4" /> Thông tin & Thuộc tính
      </h3>
      
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tên sản phẩm *</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ví dụ: Sofa da Ý cao cấp"
            className="h-12 rounded-xl text-lg font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Đường dẫn (Slug)</Label>
          <div className="flex gap-2">
            <Input 
              value={formData.slug} 
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="sofa-da-y-cao-cap"
              className="h-11 rounded-xl font-mono text-xs bg-secondary/30"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleCopySlug} className="h-11 w-11 rounded-xl shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-dashed">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
          <ListFilter className="w-3 h-3" /> Thuộc tính bộ lọc (Chọn để hiển thị giá trị)
        </Label>
        
        <div className="flex flex-wrap gap-3">
          {availableAttributes.map(attr => {
            const selectedValues = productAttrs[attr.id] || [];
            const hasSelection = selectedValues.length > 0;

            return (
              <Popover key={attr.id}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "h-10 px-4 rounded-xl text-xs font-bold gap-2 transition-all",
                      hasSelection ? "border-primary bg-primary/5 text-primary" : "border-border text-charcoal"
                    )}
                  >
                    {attr.name}
                    {hasSelection && <Badge className="ml-1 h-5 px-1.5 bg-primary text-white border-none">{selectedValues.length}</Badge>}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-[130]" align="start">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Chọn {attr.name}</p>
                    <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                      {attr.options?.map((opt: string) => (
                        <label key={opt} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors group">
                          <span className={cn("text-sm", selectedValues.includes(opt) ? "font-bold text-primary" : "text-charcoal")}>{opt}</span>
                          <Checkbox 
                            checked={selectedValues.includes(opt)}
                            onCheckedChange={() => handleAttributeChange(attr.id, opt, attr.type === 'multiple')}
                            className="data-[state=checked]:bg-primary"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
}