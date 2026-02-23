import { Info, AlertTriangle, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductDetailSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  availableAttributes: any[];
  productAttrs: Record<string, any>;
  handleAttributeChange: (attrId: string, value: any, isMulti: boolean) => void;
  isSlugDuplicate?: boolean;
}

export function ProductDetailSection({ 
  formData, 
  setFormData, 
  availableAttributes, 
  productAttrs, 
  handleAttributeChange,
  isSlugDuplicate
}: ProductDetailSectionProps) {
  
  const handleCopySlug = () => {
    if (!formData.slug) return;
    navigator.clipboard.writeText(formData.slug);
    toast.success("Đã sao chép đường dẫn!");
  };

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
      
      <div className="space-y-2">
        <Label className={cn(
          "text-[10px] font-bold uppercase text-muted-foreground",
          isSlugDuplicate && "text-destructive"
        )}>
          Đường dẫn (Slug) {isSlugDuplicate && "- ĐÃ TỒN TẠI"}
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input 
              value={formData.slug} 
              readOnly
              placeholder="Tự động tạo từ tên..." 
              className={cn(
                "h-11 rounded-xl font-mono text-xs transition-all bg-secondary/30 cursor-not-allowed",
                isSlugDuplicate && "border-destructive ring-1 ring-destructive bg-destructive/5"
              )}
            />
            {isSlugDuplicate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
          </div>
          <Button 
            type="button" 
            size="icon" 
            variant="outline" 
            onClick={handleCopySlug}
            className="h-11 w-11 rounded-xl shrink-0 border-border/60"
            title="Sao chép slug"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {isSlugDuplicate ? (
          <p className="text-[10px] text-destructive font-bold italic">Lỗi: Slug này đã được sử dụng. Vui lòng thay đổi Tên sản phẩm.</p>
        ) : (
          <p className="text-[10px] text-muted-foreground italic">* Đường dẫn được tạo tự động và duy nhất dựa trên tên sản phẩm.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả ngắn (Hiển thị nhanh)</Label>
        <Textarea 
          value={formData.short_description} 
          onChange={(e) => setFormData({...formData, short_description: e.target.value})}
          placeholder="Tóm tắt ngắn gọn về sản phẩm (hiển thị ở phần thông tin nhanh)..."
          className="rounded-xl min-h-[80px] resize-none"
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
    </div>
  );
}