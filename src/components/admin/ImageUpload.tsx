"use client";

import { useState } from "react";
import { Upload, X, Loader2, Files } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  disabled?: boolean;
  bucket?: string;
  multiple?: boolean;
  aspectRatio?: "aspect-video" | "aspect-square" | "aspect-[2/1]" | "aspect-[4/3]";
}

// Allowed image MIME types for security
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Tăng giới hạn file gốc lên 5MB vì chúng ta sẽ nén nó

export function ImageUpload({ 
  value, 
  onChange, 
  disabled, 
  bucket = "uploads", 
  multiple = false,
  aspectRatio = "aspect-video"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const processAndUploadFile = async (file: File): Promise<string> => {
    // 1. Cấu hình nén và chuyển đổi sang WebP
    const options = {
      maxSizeMB: 1,            // Dung lượng tối đa sau nén (~1MB)
      maxWidthOrHeight: 1920,  // Kích thước tối đa (Full HD)
      useWebWorker: true,
      fileType: "image/webp",  // Ép kiểu sang WebP
      initialQuality: 0.8      // Chất lượng 80%
    };

    try {
      // 2. Thực hiện nén và chuyển đổi
      const compressedFile = await imageCompression(file, options);
      
      // 3. Tạo tên file mới với đuôi .webp
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.webp`;
      const filePath = `${fileName}`;

      // 4. Tải tệp đã xử lý lên Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile, {
          contentType: "image/webp",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Không thể xử lý hình ảnh.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Kiểm tra định dạng file gốc
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`Định dạng tệp "${file.name}" không được hỗ trợ.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Tệp "${file.name}" quá lớn! Vui lòng chọn ảnh dưới 5MB.`);
          return;
        }
      }

      setIsUploading(true);
      const toastId = toast.loading("Đang tối ưu hóa và tải ảnh lên...");

      const uploadPromises = files.map(file => processAndUploadFile(file));
      const urls = await Promise.all(uploadPromises);

      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentUrls, ...urls]);
      } else {
        onChange(urls[0]);
      }

      toast.success(`Đã tối ưu và tải lên thành công ${urls.length} ảnh!`, { id: toastId });
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(url => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  return (
    <div className="w-full">
      {!multiple && value && typeof value === 'string' ? (
        <div className={cn(
          "relative w-full max-w-sm rounded-2xl overflow-hidden border border-border bg-secondary/20 group",
          aspectRatio
        )}>
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => handleRemove(value)}
              className="p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors"
              type="button"
              disabled={disabled}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className={cn(
            "flex flex-col items-center justify-center w-full border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all group",
            aspectRatio === "aspect-square" ? "aspect-square max-w-[200px]" : "h-32"
          )}>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                  <p className="text-[10px] text-muted-foreground font-medium">Đang tối ưu hóa...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {multiple ? <Files className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-bold text-primary">Tải {multiple ? "nhiều ảnh" : "ảnh"}</span>
                    <br />
                    <span className="opacity-60">(Tự động chuyển sang WebP)</span>
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleUpload}
              disabled={disabled || isUploading}
              multiple={multiple}
            />
          </label>
        </div>
      )}
    </div>
  );
}