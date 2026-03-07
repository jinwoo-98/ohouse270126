"use client";

import { useState } from "react";
import { Upload, X, Loader2, Video, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HLSVideoPlayer } from "@/components/ui/HLSVideoPlayer";

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

    setIsUploading(true);
    setStatus('uploading');
    setUploadProgress(0);
    const toastId = toast.loading("Đang chuẩn bị tải lên...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 1. Tạo URL tải lên trực tiếp tới Mux
      const response = await fetch("https://kyfzqgyazmjtnxjdvetr.supabase.co/functions/v1/process-video", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'create-upload' })
      });

      const uploadData = await response.json();
      if (!uploadData.url) throw new Error("Không thể tạo cổng tải lên.");

      // 2. Tải file trực tiếp từ trình duyệt tới Mux (Nhanh hơn qua server trung gian)
      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('PUT', uploadData.url);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error("Lỗi kết nối mạng."));
        xhr.send(file);
      });

      toast.loading(`Đang tải video lên (${(file.size / 1024 / 1024).toFixed(1)}MB)...`, { id: toastId });
      await uploadPromise;

      // 3. Đợi Mux xử lý video
      setStatus('processing');
      toast.loading("Video đang được tối ưu hóa trên máy chủ Mux...", { id: toastId });

      let attempts = 0;
      const checkStatus = async () => {
        const statusRes = await fetch("https://kyfzqgyazmjtnxjdvetr.supabase.co/functions/v1/process-video", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'check-status', uploadId: uploadData.id })
        });

        const statusData = await statusRes.json();
        if (statusData.url) {
          onChange(statusData.url);
          setStatus('ready');
          toast.success("Video đã sẵn sàng!", { id: toastId });
          setIsUploading(false);
        } else if (attempts < 60) {
          attempts++;
          setTimeout(checkStatus, 3000);
        } else {
          toast.error("Thời gian xử lý quá lâu. Vui lòng thử lại sau.", { id: toastId });
          setIsUploading(false);
        }
      };

      checkStatus();

    } catch (error: any) {
      toast.error("Lỗi: " + error.message, { id: toastId });
      setIsUploading(false);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-2xl overflow-hidden border border-border bg-black group shadow-lg">
          <HLSVideoPlayer 
            src={value} 
            className="w-full h-full object-cover" 
            muted playsInline autoPlay loop 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => { if (confirm("Xóa video này?")) onChange(""); }}
              className="p-3 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-all transform hover:scale-110"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-primary/90 text-[9px] uppercase tracking-widest">Mux Stream</Badge>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className={cn(
            "flex flex-col items-center justify-center w-full max-w-[240px] aspect-[9/16] border-2 border-dashed border-border rounded-3xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40 transition-all group relative overflow-hidden",
            isUploading && "cursor-not-allowed"
          )}>
            <div className="flex flex-col items-center justify-center p-6 text-center z-10">
              {isUploading ? (
                <>
                  <Loader2 className="w-10 h-10 mb-4 text-primary animate-spin" />
                  <p className="text-xs font-bold text-charcoal uppercase tracking-wider">
                    {status === 'uploading' ? `Đang tải: ${uploadProgress}%` : 'Đang tối ưu...'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">Vui lòng không đóng trình duyệt</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-charcoal uppercase tracking-widest">Tải video lên</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Hỗ trợ MP4, MOV (Tối đa 500MB)</p>
                </>
              )}
            </div>
            
            {isUploading && status === 'uploading' && (
              <div className="absolute bottom-0 left-0 h-1.5 bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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