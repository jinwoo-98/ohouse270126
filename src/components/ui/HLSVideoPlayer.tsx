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

      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // Đảm bảo video luôn ở trạng thái sẵn sàng tự động phát
      video.muted = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Hỗ trợ gốc (Safari/iOS)
        video.src = src;
        video.play().catch(() => {});
      } else if (Hls.isSupported()) {
        // Sử dụng hls.js cho Chrome/Edge/Firefox
        const hls = new Hls({
          capLevelToPlayerSize: true, // Giới hạn chất lượng theo kích thước khung hình để tải nhanh hơn
          autoStartLoad: true,
          startPosition: -1,
          maxBufferLength: 10, // Giảm buffer để bắt đầu nhanh hơn
          enableWorker: true,
        });
        
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Ra lệnh phát ngay khi manifest sẵn sàng
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Nếu trình duyệt chặn, ta sẽ thử lại khi có tương tác
              console.warn("[HLSVideoPlayer] Autoplay prevented");
            });
          }
        });
        
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    }, [src]);

    return (
      <video 
        ref={internalVideoRef} 
        {...props} 
      />
    );
  }
);

HLSVideoPlayer.displayName = "HLSVideoPlayer";