import { Sparkles, Eye, Copy, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

interface LookbookBasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  slugStatus: SlugStatus;
}

export function LookbookBasicInfoSection({ 
  formData, 
  setFormData, 
  categories,
  slugStatus
}: LookbookBasicInfoSectionProps) {
  const parentCategories = categories.filter(c => !c.parent_id && c.menu_location === 'main');

  const handleCopySlug = () => {
    if (!formData.slug) return;
    navigator.clipboard.writeText(formData.slug);
    toast.success("Đã sao chép đường dẫn!");
  };

  const renderSlugStatus = () => {
    switch (slugStatus) {
      case 'checking':
        return <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Đang kiểm tra...</div>;
      case 'available':
        return <div className="flex items-center gap-1.5 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Có thể sử dụng</div>;
      case 'taken':
        return <div className="flex items-center gap-1.5 text-xs text-destructive"><AlertTriangle className="w-3.5 h-3.5" /> Đường dẫn đã tồn tại</div>;
      default:
        return <p className="text-xs text-muted-foreground">Sẽ được tạo tự động từ tên.</p>;
    }
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
          <div className="relative flex-1">
            <Input 
              value={formData.slug} 
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="Tự động tạo từ tên..." 
              className={cn(
                "h-11 rounded-xl font-mono text-xs transition-all bg-secondary/30",
                slugStatus === 'taken' && "border-destructive ring-1 ring-destructive bg-destructive/5",
                slugStatus === 'available' && "border-green-500 ring-1 ring-green-500/50 bg-green-50"
              )}
            />
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
        <div className="h-4 mt-1.5 px-1">{renderSlugStatus()}</div>
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