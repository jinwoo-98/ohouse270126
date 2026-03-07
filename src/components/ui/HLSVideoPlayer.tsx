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

      // Dọn dẹp instance cũ
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Thiết lập thuộc tính bắt buộc để tự động phát
      video.muted = true;
      video.setAttribute('muted', 'true');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      const initPlayer = () => {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari / iOS
          video.src = src;
        } else if (Hls.isSupported()) {
          // Chrome / Android / PC
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            // Tăng khả năng chịu lỗi mạng
            manifestLoadingMaxRetry: 6,
            levelLoadingMaxRetry: 6,
            fragLoadingMaxRetry: 6,
          });
          
          hls.loadSource(src);
          hls.attachMedia(video);
          hlsRef.current = hls;
          
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
      };

      initPlayer();

      // Luôn cố gắng gọi play() sau khi gán nguồn
      const playVideo = () => {
        video.play().catch(err => {
          console.warn("[HLSPlayer] Autoplay blocked:", err);
        });
      };

      video.addEventListener('loadedmetadata', playVideo, { once: true });

      return () => {
        video.removeEventListener('loadedmetadata', playVideo);
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
        className={cn("bg-black", props.className)}
      />
    );
  }
);

import { cn } from '@/lib/utils';
HLSVideoPlayer.displayName = "HLSVideoPlayer";