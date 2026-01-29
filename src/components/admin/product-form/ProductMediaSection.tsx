import { Image as ImageIcon, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface ProductMediaSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ProductMediaSection({ formData, setFormData }: ProductMediaSectionProps) {
  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Hình ảnh đại diện (Ảnh chính)
        </h3>
        <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url as string})} />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Bộ sưu tập ảnh (Ảnh phụ)
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {formData.gallery_urls.map((url: string, idx: number) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={url} alt="Gallery" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => handleRemoveGalleryImage(idx)}
                className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
          <ImageUpload 
            multiple
            value={formData.gallery_urls}
            onChange={(urls) => setFormData((prev: any) => ({ ...prev, gallery_urls: urls as string[] }))} 
          />
          <p className="text-[10px] text-muted-foreground mt-3 text-center italic">Chọn nhiều ảnh cùng lúc để tải lên bộ sưu tập.</p>
        </div>
      </div>
    </div>
  );
}