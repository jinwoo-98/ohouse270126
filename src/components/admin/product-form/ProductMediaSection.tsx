import { Image as ImageIcon, X, Ruler, FileText, AlignLeft } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";

interface ProductMediaSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ProductMediaSection({ formData, setFormData }: ProductMediaSectionProps) {
  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery_urls: (prev.gallery_urls || []).filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <ImageIcon className="w-4 h-4" /> Hình ảnh & Mô tả
      </h3>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Cột ảnh */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh đại diện chính</Label>
            <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url as string})} />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Bộ sưu tập ảnh phụ</Label>
            <div className="grid grid-cols-3 gap-3">
              {(formData.gallery_urls || []).map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <ImageUpload multiple value={formData.gallery_urls} onChange={(urls) => setFormData((prev: any) => ({ ...prev, gallery_urls: urls as string[] }))} />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh kích thước kỹ thuật</Label>
            <ImageUpload value={formData.dimension_image_url} onChange={(url) => setFormData({...formData, dimension_image_url: url as string})} />
          </div>
        </div>

        {/* Cột mô tả */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
              <FileText className="w-3 h-3" /> Mô tả ngắn (Hiển thị nhanh)
            </Label>
            <Textarea 
              value={formData.short_description} 
              onChange={(e) => setFormData({...formData, short_description: e.target.value})}
              placeholder="Tóm tắt ngắn gọn về sản phẩm..."
              className="rounded-xl min-h-[120px] resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Bài viết mô tả chi tiết
              </Label>
              <AIContentAssistant 
                contentType="product" 
                contextTitle={formData.name} 
                onInsert={(val) => setFormData({...formData, description: val})} 
              />
            </div>
            <RichTextEditor 
              value={formData.description} 
              onChange={(val) => setFormData({...formData, description: val})} 
              contextTitle={formData.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}