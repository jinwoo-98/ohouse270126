import { Layers, TrendingUp, Star, ShoppingBag, Clock, Sparkles, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ProductStatusSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ProductStatusSection({ formData, setFormData }: ProductStatusSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReviews = async () => {
    const count = parseInt(formData.fake_review_count);
    const rating = parseFloat(formData.fake_rating);

    if (!formData.id) {
      toast.error("Vui lòng lưu sản phẩm trước khi tạo đánh giá.");
      return;
    }

    if (!count || count <= 0) {
      toast.error("Vui lòng nhập số lượng đánh giá ảo cần tạo.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("AI đang viết đánh giá chân thực...");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-reviews', {
        body: {
          productId: formData.id,
          productName: formData.name,
          count,
          rating
        }
      });

      if (error) throw error;
      
      toast.success(`Đã tạo thành công ${data.count} đánh giá bằng AI!`, { id: toastId });
    } catch (e: any) {
      toast.error("Lỗi: " + e.message, { 
        id: toastId,
        description: "Hãy kiểm tra Gemini API Key trong phần Cài đặt hệ thống." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Layers className="w-4 h-4" /> Trạng thái & Badge
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-[10px] font-bold uppercase">Sản phẩm Mới</span>
            <Switch checked={formData.is_new} onCheckedChange={(val) => setFormData({...formData, is_new: val})} />
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-[10px] font-bold uppercase">Flash Sale</span>
            <Switch checked={formData.is_sale} onCheckedChange={(val) => setFormData({...formData, is_sale: val})} />
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-[10px] font-bold uppercase">Nổi Bật</span>
            <Switch checked={formData.is_featured} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-dashed">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Chỉ số ảo (Marketing)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Đã bán
            </Label>
            <Input type="number" value={formData.fake_sold} onChange={e=>setFormData({...formData, fake_sold: e.target.value})} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3" /> Đánh giá
            </Label>
            <Input type="number" value={formData.fake_review_count} onChange={e=>setFormData({...formData, fake_review_count: e.target.value})} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" /> Điểm sao
            </Label>
            <Input type="number" step="0.1" value={formData.fake_rating} onChange={e=>setFormData({...formData, fake_rating: e.target.value})} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Thứ tự
            </Label>
            <Input type="number" value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="h-10 rounded-lg" />
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 rounded-xl border-primary/30 text-primary font-bold text-xs uppercase tracking-widest gap-2 hover:bg-primary/5"
            onClick={handleGenerateReviews}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Tạo nội dung đánh giá AI
          </Button>
          <p className="text-[9px] text-muted-foreground mt-2 italic text-center">
            * AI sẽ viết nội dung dựa trên số lượng và điểm sao ở trên.
          </p>
        </div>
      </div>
    </div>
  );
}