"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export const HLSVideoPlayer = forwardRef<HTMLVideoElement, HLSVideoPlayerProps>(
  ({ src, ...props }, ref) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useImperativeHandle(ref, () => internalVideoRef.current!);

    useEffect(() => {
      const video = internalVideoRef.current;
      if (!video || !src) return;

      // Hủy instance cũ nếu có
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Cấu hình video cơ bản để vượt qua bộ lọc trình duyệt
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', 'true');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.preload = "auto";

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Hỗ trợ gốc (Safari/iOS) - Phát trực tiếp
        video.src = src;
        video.play().catch(err => console.warn("[HLS] Native play failed:", err));
      } else if (Hls.isSupported()) {
        // Sử dụng hls.js cho Chrome/Edge/Firefox
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true, // Chế độ trễ thấp
          backBufferLength: 60,
          manifestLoadingMaxRetry: 10,
          levelLoadingMaxRetry: 10,
          fragLoadingMaxRetry: 10,
          startLevel: 0, // Bắt đầu từ chất lượng thấp nhất để hiện hình nhanh nhất
          abrEwmaDefaultEstimate: 500000,
          testBandwidth: false,
        });
        
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("[HLS] Manifest parsed, attempting play...");
          video.play().catch(err => {
            console.warn("[HLS] Autoplay blocked, waiting for interaction", err);
          });
        });

        // Tự động khôi phục khi gặp lỗi mạng hoặc lỗi media
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("[HLS] Network error, retrying...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("[HLS] Media error, recovering...");
                hls.recoverMediaError();
                break;
              default:
                console.error("[HLS] Unrecoverable error:", data);
                hls.destroy();
                break;
            }
          }
        });
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [src]);

    return (
      <video 
        ref={internalVideoRef} 
        {...props}
        muted // Đảm bảo prop muted luôn có mặt trong DOM
        playsInline
      />
    );
  }
);

HLSVideoPlayer.displayName = "HLSVideoPlayer";