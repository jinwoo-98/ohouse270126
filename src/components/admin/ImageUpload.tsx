import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  bucket?: string;
}

export function ImageUpload({ value, onChange, disabled, bucket = "uploads" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Giới hạn dung lượng 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }

      setIsUploading(true);

      // Tạo tên file duy nhất để tránh trùng lặp
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Thực hiện upload lên Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        // Nếu lỗi do chưa có bucket, báo cho admin
        if (uploadError.message.includes("not found")) {
          throw new Error(`Bucket '${bucket}' không tồn tại. Vui lòng kiểm tra cấu hình Storage.`);
        }
        throw uploadError;
      }

      // Lấy URL công khai sau khi upload thành công
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Tải ảnh lên thành công!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsUploading(false);
      // Reset input để có thể chọn lại cùng 1 file nếu muốn
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative aspect-video w-full max-w-sm rounded-2xl overflow-hidden border border-border bg-secondary/20 group">
          <img 
            src={value} 
            alt="Uploaded" 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
              type="button"
              disabled={disabled}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-sm">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader2 className="w-10 h-10 mb-3 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium">Đang tải lên...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-bold text-primary">Nhấn để tải lên</span> hoặc kéo thả
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PNG, JPG, WEBP (Max 2MB)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleUpload}
              disabled={disabled || isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}