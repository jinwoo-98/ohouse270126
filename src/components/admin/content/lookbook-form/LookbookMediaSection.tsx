import { Image as ImageIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface LookbookMediaSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveEditingImage: (url: string) => void;
}

export function LookbookMediaSection({ formData, setFormData, setActiveEditingImage }: LookbookMediaSectionProps) {
  
  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Quản lý ảnh</h3>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh chính (Gallery & Hotspot)</Label>
        <ImageUpload 
          value={formData.image_url} 
          onChange={(url) => { 
            setFormData({...formData, image_url: url as string}); 
            setActiveEditingImage(url as string); 
          }} 
        />
      </div>
      
      <div className="space-y-2 pt-4 border-t border-dashed">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh cho Shop The Look (Trang chủ)</Label>
        <ImageUpload 
          value={formData.homepage_image_url} 
          onChange={(url) => setFormData({...formData, homepage_image_url: url as string})} 
        />
        <p className="text-[10px] text-muted-foreground italic">Ảnh này sẽ hiển thị ở mục Shop The Look trên trang chủ. Nếu để trống, sẽ dùng ảnh chính.</p>
      </div>
      
      <div className="space-y-2 pt-4 border-t border-dashed">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh phụ (Gallery)</Label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(formData.gallery_urls || []).map((url: string, idx: number) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={url} alt="Gallery" className="w-full h-full object-cover" />
              <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
          <ImageUpload 
            multiple 
            value={formData.gallery_urls} 
            onChange={(urls) => setFormData((prev: any) => ({ ...prev, gallery_urls: urls as string[] }))} 
          />
        </div>
      </div>
    </div>
  );
}