"use client";

import { useState } from "react";
import { Upload, X, Loader2, Files } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  disabled?: boolean;
  bucket?: string;
  multiple?: boolean;
}

export function ImageUpload({ value, onChange, disabled, bucket = "uploads", multiple = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Kiểm tra dung lượng
      const oversized = files.some(f => f.size > 2 * 1024 * 1024);
      if (oversized) {
        toast.error("Một số ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }

      setIsUploading(true);

      // Tải lên tất cả các file và giữ nguyên thứ tự bằng Promise.all
      // Chúng ta map qua danh sách file gốc để kết quả trả về đúng thứ tự đó
      const uploadPromises = files.map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);

      if (multiple) {
        // Nếu là multiple, gộp vào mảng hiện tại
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentUrls, ...urls]);
      } else {
        // Nếu không, chỉ lấy ảnh đầu tiên
        onChange(urls[0]);
      }

      toast.success(`Đã tải lên thành công ${urls.length} ảnh!`);
    } catch (error: any) {
      toast.error("Lỗi tải lên: " + error.message);
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

  // Giao diện cho trường hợp Multiple sẽ được quản lý bởi component cha (ProductForm)
  // Component này chỉ đóng vai trò là nút bấm/vùng chọn file
  return (
    <div className="w-full">
      {!multiple && value && typeof value === 'string' ? (
        <div className="relative aspect-video w-full max-w-sm rounded-2xl overflow-hidden border border-border bg-secondary/20 group">
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
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Đang xử lý...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {multiple ? <Files className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-primary">Nhấn để tải {multiple ? "nhiều ảnh" : "ảnh"}</span>
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
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