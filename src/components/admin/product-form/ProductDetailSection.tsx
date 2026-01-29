import { Info } from "lucide-react";
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
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";

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
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Info className="w-4 h-4" /> 3. Thông tin chi tiết
      </h3>
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tên sản phẩm đầy đủ *</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Ví dụ: Sofa da Ý cao cấp 3 chỗ ngồi"
          required
          className="h-12 rounded-xl text-lg font-bold"
        />
      </div>
      
      {/* Attributes Section */}
      {availableAttributes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/10 rounded-2xl">
          {availableAttributes.map(attr => (
            <div key={attr.id} className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">{attr.name}</Label>
              
              {attr.type === 'single' ? (
                <Select 
                  value={productAttrs[attr.id]?.[0] || ""} 
                  onValueChange={(val) => handleAttributeChange(attr.id, val, false)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={`Chọn ${attr.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {attr.options?.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-3 p-3 border rounded-xl bg-white">
                  {attr.options?.map((opt: string) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`${attr.id}-${opt}`}
                        checked={productAttrs[attr.id]?.includes(opt)}
                        onCheckedChange={() => handleAttributeChange(attr.id, opt, true)}
                      />
                      <Label htmlFor={`${attr.id}-${opt}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả bài viết</Label>
          <AIContentAssistant 
            contentType="product" 
            contextTitle={formData.name} 
            onInsert={(val) => setFormData({...formData, description: val})} 
          />
        </div>
        <RichTextEditor 
          value={formData.description} 
          onChange={(val) => setFormData({...formData, description: val})} 
          placeholder="Mô tả kỹ thuật, kích thước, ưu điểm của sản phẩm..."
        />
      </div>
    </div>
  );
}