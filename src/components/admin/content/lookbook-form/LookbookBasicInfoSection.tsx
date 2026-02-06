import { Sparkles, Eye, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LookbookBasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
}

export function LookbookBasicInfoSection({ formData, setFormData, categories }: LookbookBasicInfoSectionProps) {
  const parentCategories = categories.filter(c => !c.parent_id && c.menu_location === 'main');

  const handleCopySlug = () => {
    navigator.clipboard.writeText(formData.slug);
    toast.success("Đã sao chép slug!");
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles className="w-4 h-4" /> Thông tin cơ bản</h3>
      
      <div className="space-y-2">
        <Label>Tên Lookbook</Label>
        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="VD: Phòng khách Bắc Âu" className="h-11 rounded-xl" />
      </div>
      
      <div className="space-y-2">
        <Label>Đường dẫn (Slug)</Label>
        <div className="flex items-center gap-2">
          <Input 
            value={formData.slug} 
            onChange={e => setFormData({...formData, slug: e.target.value})}
            placeholder="Tự động tạo từ tên..." 
            className="h-11 rounded-xl font-mono text-xs bg-secondary/50" 
          />
          <Button type="button" size="icon" variant="outline" onClick={handleCopySlug} className="h-11 w-11 rounded-xl shrink-0">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground italic">* Slug được tạo tự động từ tên. Bạn có thể sao chép hoặc chỉnh sửa thủ công.</p>
      </div>

      <div className="space-y-2">
        <Label>Hiển thị tại danh mục</Label>
        <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
          <SelectContent className="max-h-80">
            {parentCategories.map(parent => (
              <SelectGroup key={parent.id}>
                <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                <SelectItem value={parent.slug}>-- Trang chính {parent.name}</SelectItem>
                {categories.filter(c => c.parent_id === parent.id).map(child => (
                  <SelectItem key={child.id} value={child.slug}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground italic">Lookbook sẽ hiển thị ở cuối trang danh mục này.</p>
      </div>

      <div className="pt-6 border-t border-dashed">
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex flex-col">
            <Label className="font-bold text-sm text-charcoal flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Trạng thái hiển thị
            </Label>
            <p className="text-[10px] text-muted-foreground mt-1">
              Bật để Lookbook xuất hiện trên trang web công khai.
            </p>
          </div>
          <Switch 
            checked={formData.is_active} 
            onCheckedChange={(val) => setFormData({...formData, is_active: val})} 
          />
        </div>
      </div>
    </div>
  );
}