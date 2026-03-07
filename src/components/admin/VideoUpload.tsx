"use client";

import { useState } from "react";
import { Upload, X, Loader2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn, slugify } from "@/lib/utils";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  bucket?: string;
}

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // Tăng giới hạn lên 100MB

export function VideoUpload({ 
  value, 
  onChange, 
  disabled, 
  bucket = "uploads"
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Định dạng video không được hỗ trợ. Chỉ chấp nhận MP4, WebM, MOV.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Video quá lớn! Vui lòng chọn video dưới 100MB.`);
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading(`Đang tải lên video...`);

      const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop();
      const fileName = `${slugify(originalName)}-${randomString}.${fileExt}`;
      const filePath = `videos/${fileName}`; // Lưu vào thư mục videos

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success(`Đã tải lên video thành công!`, { id: toastId });
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden border border-border bg-black group shadow-md">
          <video 
            src={`${value}#t=0.1`} 
            className="w-full h-full object-cover" 
            preload="metadata"
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
        <div className="flex items-center justify-center w-full">
          <label className={cn(
            "flex flex-col items-center justify-center w-full max-w-[200px] aspect-[9/16] border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all group"
          )}>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                  <p className="text-[10px] text-muted-foreground font-medium">Đang tải lên...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-bold text-primary">Tải video lên</span>
                    <br />
                    <span className="opacity-60">(Tối đa 100MB)</span>
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleUpload}
              disabled={disabled || isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}