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

    // Giới hạn 500MB
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video quá lớn! Vui lòng chọn video dưới 500MB.");
      return;
    }

    setIsUploading(true);
    setStatus('uploading');
    setUploadProgress(0);
    const toastId = toast.loading("Đang khởi tạo cổng tải lên an toàn...");

    try {
      const FUNCTION_URL = "https://kyfzqgyazmjtnxjdvetr.supabase.co/functions/v1/process-video";
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("Vui lòng đăng nhập lại để thực hiện tác vụ này.");

      // 1. Tạo Upload URL từ Mux thông qua Edge Function
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'create-upload' })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Máy chủ xử lý video đang bận. Vui lòng thử lại sau.");
      }
      
      const uploadData = await response.json();
      const { url: uploadUrl, id: uploadId } = uploadData;

      if (!uploadUrl) throw new Error("Không nhận được địa chỉ tải lên từ máy chủ.");

      // 2. Tải file trực tiếp lên Google Cloud Storage (qua Mux URL)
      toast.loading(`Đang tải video lên (${(file.size / (1024 * 1024)).toFixed(1)}MB)...`, { id: toastId });
      
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('PUT', uploadUrl);
        
        // Quan trọng: Không đặt Authorization header khi tải lên URL đã ký của Google/Mux
        // Nhưng cần đặt Content-Type khớp với tệp để tránh lỗi signature
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            console.error("[VideoUpload] Upload failed with status:", xhr.status, xhr.responseText);
            reject(new Error(`Máy chủ từ chối tệp tin (Lỗi ${xhr.status}).`));
          }
        };

        xhr.onerror = () => {
          console.error("[VideoUpload] XHR Network Error");
          reject(new Error("Kết nối bị chặn hoặc gián đoạn. Vui lòng kiểm tra mạng hoặc VPN."));
        };

        xhr.onabort = () => reject(new Error("Quá trình tải lên đã bị hủy."));
        
        xhr.send(file);
      });

      await uploadPromise;

      // 3. Kiểm tra trạng thái xử lý của Mux
      setStatus('processing');
      toast.loading("Đang tối ưu hóa video cho mọi thiết bị...", { id: toastId });

      let attempts = 0;
      const maxAttempts = 60; // 2 phút

      const checkStatus = async () => {
        try {
          const statusRes = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'check-status', uploadId })
          });

          if (!statusRes.ok) {
            // Nếu lỗi mạng tạm thời, cứ để nó thử lại
            setTimeout(checkStatus, 3000);
            return;
          }

          const statusData = await statusRes.json();

          if (statusData.url) {
            onChange(statusData.url);
            setStatus('ready');
            toast.success("Video đã được xử lý thành công!", { id: toastId });
            setIsUploading(false);
            return;
          }

          if (statusData.status === 'error') {
            throw new Error("Máy chủ Mux báo lỗi khi xử lý video này.");
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 2500);
          } else {
            toast.error("Video đang được xử lý ngầm, bạn có thể lưu sản phẩm và quay lại sau.", { id: toastId });
            setIsUploading(false);
          }
        } catch (err: any) {
          console.error("[VideoUpload] Status check error:", err);
          toast.error("Lỗi kiểm tra trạng thái: " + (err.message || "Không xác định"), { id: toastId });
          setIsUploading(false);
        }
      };

      checkStatus();

    } catch (error: any) {
      console.error("[VideoUpload] Catch Error:", error);
      const msg = error?.message || "Đã có lỗi xảy ra.";
      toast.error("Lỗi: " + msg, { id: toastId });
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
              onClick={() => {
                if (confirm("Xóa video này?")) onChange("");
              }}
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
                    {status === 'uploading' ? `Tải lên: ${uploadProgress}%` : 'Đang xử lý...'}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">Vui lòng giữ trình duyệt mở</p>
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