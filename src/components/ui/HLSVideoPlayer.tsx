"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

/**
 * A specialized video player component for HLS (.m3u8) streams.
 * Uses native support where available (Safari/iOS) and hls.js for other browsers.
 * Wrapped in forwardRef to allow parent components to control the video element.
 */
export const HLSVideoPlayer = forwardRef<HTMLVideoElement, HLSVideoPlayerProps>(
  ({ src, ...props }, ref) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // Expose the internal video element to the forwarded ref
    useImperativeHandle(ref, () => internalVideoRef.current!);

    useEffect(() => {
      const video = internalVideoRef.current;
      if (!video || !src) return;

      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Reset video source
      video.src = "";

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari, iOS, some Android browsers)
        video.src = src;
      } else if (Hls.isSupported()) {
        // Use hls.js for browsers without native HLS support (Chrome, Firefox, Edge)
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          manifestLoadingMaxRetry: 4,
          levelLoadingMaxRetry: 4,
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
      />
    );
  }
);

HLSVideoPlayer.displayName = "HLSVideoPlayer";