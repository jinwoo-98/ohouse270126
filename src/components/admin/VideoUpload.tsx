"use client";

import { useState, useEffect } from "react";
import { Upload, X, Loader2, Video, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function VideoUpload({ value, onChange, disabled }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready'>('idle');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video quá lớn! Vui lòng chọn video dưới 500MB.");
      return;
    }

    setIsUploading(true);
    setStatus('uploading');
    const toastId = toast.loading("Đang kết nối với máy chủ xử lý video...");

    try {
      // Sử dụng URL đầy đủ để gọi Edge Function theo quy tắc của hệ thống
      const FUNCTION_URL = "https://kyfzqgyazmjtnxjdvetr.supabase.co/functions/v1/process-video";
      
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ action: 'create-upload' })
      });

      if (!response.ok) throw new Error("Không thể khởi tạo cổng tải lên.");
      const uploadData = await response.json();

      const { url: uploadUrl, id: uploadId } = uploadData;

      toast.loading(`Đang tải video lên (${(file.size / (1024 * 1024)).toFixed(1)}MB)...`, { id: toastId });
      
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve(xhr.response) : reject();
        xhr.onerror = () => reject();
      });

      xhr.send(file);
      await uploadPromise;

      setStatus('processing');
      toast.loading("Video đã tải xong, đang tối ưu hóa...", { id: toastId });

      let attempts = 0;
      const checkStatus = async () => {
        const statusRes = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ action: 'check-status', uploadId })
        });

        const statusData = await statusRes.json();

        if (statusData.url) {
          onChange(statusData.url);
          setStatus('ready');
          toast.success("Video đã sẵn sàng!", { id: toastId });
          setIsUploading(false);
          return;
        }

        attempts++;
        if (attempts < 30) {
          setTimeout(checkStatus, 2000);
        } else {
          toast.error("Xử lý video hơi lâu, vui lòng kiểm tra lại sau vài phút.", { id: toastId });
          setIsUploading(false);
        }
      };

      checkStatus();

    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi tải video: " + error.message, { id: toastId });
      setIsUploading(false);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden border border-border bg-black group shadow-md">
          <video 
            key={value}
            src={value} 
            className="w-full h-full object-cover" 
            muted playsInline autoPlay loop 
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange("")}
              className="p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors"
              type="button"
              disabled={disabled}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-primary/80 text-[8px] uppercase">Mux Stream</Badge>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className={cn(
            "flex flex-col items-center justify-center w-full max-w-[200px] aspect-[9/16] border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all group relative overflow-hidden",
            isUploading && "cursor-not-allowed"
          )}>
            <div className="flex flex-col items-center justify-center p-4 text-center z-10">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                  <p className="text-[10px] font-bold text-charcoal uppercase">
                    {status === 'uploading' ? `Đang tải: ${uploadProgress}%` : 'Đang xử lý...'}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">Vui lòng không đóng trình duyệt</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-bold text-primary">Tải video lên Mux</span>
                    <br />
                    <span className="opacity-60">(Hỗ trợ file lớn)</span>
                  </p>
                </>
              )}
            </div>
            
            {isUploading && status === 'uploading' && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            )}

            <input 
              type="file" 
              className="hidden" 
              accept="video/*"
              onChange={handleUpload}
              disabled={disabled || isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}