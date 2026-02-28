import { Sparkles, Eye, Copy, AlertTriangle, AlignLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LookbookBasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  isSlugDuplicate?: boolean;
}

export function LookbookBasicInfoSection({ 
  formData, 
  setFormData, 
  categories,
  isSlugDuplicate
}: LookbookBasicInfoSectionProps) {
  const parentCategories = categories.filter(c => !c.parent_id && c.menu_location === 'main');

  const handleCopySlug = () => {
    if (!formData.slug) return;
    navigator.clipboard.writeText(formData.slug);
    toast.success("Đã sao chép đường dẫn!");
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles className="w-4 h-4" /> Thông tin cơ bản</h3>
      
      <div className="space-y-2">
        <Label>Tên Lookbook</Label>
        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="VD: Phòng khách Bắc Âu" className="h-11 rounded-xl" />
      </div>
      
      <div className="space-y-2">
        <Label className={cn(isSlugDuplicate && "text-destructive")}>
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
                isSlugDuplicate ? "border-destructive ring-1 ring-destructive bg-destructive/5" : ""
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
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2"><AlignLeft className="w-3 h-3" /> Mô tả ngắn</Label>
        <Textarea 
          value={formData.description || ""} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="Nhập đoạn giới thiệu ngắn về không gian này..." 
          className="rounded-xl min-h-[100px] resize-none text-sm leading-relaxed"
        />
        <p className="text-[10px] text-muted-foreground italic">Hiển thị ngay trên ảnh chính ở trang chi tiết.</p>
      </div>

      <div className="space-y-2">
        <Label>Hiển thị tại danh mục</Label>
        <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
          <SelectContent className="max-h-80">
            {parentCategories.map(parent => (
              <SelectGroup key={parent.id}>
                <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                <SelectItem value={parent.id}>-- Trang chính {parent.name}</SelectItem>
                {categories.filter(c => c.parent_id === parent.id).map(child => (
                  <SelectItem key={child.id} value={child.id}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
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