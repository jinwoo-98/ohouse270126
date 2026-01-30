import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, Loader2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ShippingInfoDialog } from "./ShippingInfoDialog";
import { cn } from "@/lib/utils";

export function HeaderTopBanner() {
  const [settings, setSettings] = useState<any>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*').single();
      setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const messages = settings?.top_banner_messages || [];
  const currentMsg = messages[currentMsgIndex];

  // Logic đếm ngược dựa trên thông điệp hiện tại
  useEffect(() => {
    if (!currentMsg?.end_time) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const timer = setInterval(() => {
      const end = new Date(currentMsg.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMsgIndex, messages, currentMsg?.end_time]);

  // Xoay vòng thông điệp
  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [messages.length]);

  if (loading) return <div className="bg-primary h-10 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-white" /></div>;
  if (messages.length === 0) return null;

  const hasCountdown = currentMsg?.end_time && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);
  const textColor = settings?.top_banner_text_color || '#FFFFFF';
  const countdownColor = settings?.top_banner_countdown_color || '#000000';

  return (
    <>
      <div className="bg-primary text-primary-foreground overflow-hidden w-full" style={{ color: textColor }}>
        <div className="container-luxury flex items-center justify-between h-10 text-[10px] md:text-xs">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="relative h-6 flex-1 max-w-full md:max-w-[450px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMsgIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center gap-2 md:gap-3"
                >
                  {/* Nội dung thông báo (Sử dụng content từ Rich Text Editor) */}
                  <div 
                    className="font-bold underline-offset-2 hover:no-underline block max-w-full text-left top-banner-text-container"
                    style={{ color: textColor }}
                  >
                    <span 
                      className="top-banner-text"
                      dangerouslySetInnerHTML={{ __html: currentMsg.content || currentMsg.text || "" }} 
                    />
                  </div>

                  {hasCountdown && (
                    <div className="flex items-center gap-1 shrink-0 animate-fade-in scale-[0.85] origin-left">
                      <div className="flex items-center gap-0.5">
                        {countdown.days > 0 && (
                          <>
                            <div className="px-1 py-0.5 rounded-sm font-mono font-bold min-w-[18px] text-center border border-white/10" style={{ backgroundColor: countdownColor, color: textColor }}>
                              {countdown.days}d
                            </div>
                            <span className="text-[8px] font-bold mx-0.5" style={{ color: textColor }}>:</span>
                          </>
                        )}
                        <div className="px-0.5 py-0.5 rounded-sm font-mono font-bold min-w-[16px] text-center border border-white/10" style={{ backgroundColor: countdownColor, color: textColor }}>
                          {String(countdown.hours).padStart(2, '0')}
                        </div>
                        <span className="text-[8px] font-bold mx-0.5" style={{ color: textColor }}>:</span>
                        <div className="px-0.5 py-0.5 rounded-sm font-mono font-bold min-w-[16px] text-center border border-white/10" style={{ backgroundColor: countdownColor, color: textColor }}>
                          {String(countdown.minutes).padStart(2, '0')}
                        </div>
                        <span className="text-[8px] font-bold mx-0.5" style={{ color: textColor }}>:</span>
                        <div className="px-0.5 py-0.5 rounded-sm font-mono font-bold min-w-[16px] text-center border border-white/10 animate-pulse" style={{ backgroundColor: countdownColor, color: textColor }}>
                          {String(countdown.seconds).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {settings.top_banner_shipping && (
            <button 
              onClick={() => setIsShippingDialogOpen(true)}
              className="hidden sm:flex items-center gap-2 font-bold uppercase tracking-wider opacity-90 hover:opacity-100 transition-opacity shrink-0"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{settings.top_banner_shipping}</span>
              <Info className="w-3 h-3 ml-1 opacity-60" />
            </button>
          )}
        </div>
      </div>

      <ShippingInfoDialog 
        isOpen={isShippingDialogOpen} 
        onClose={() => setIsShippingDialogOpen(false)} 
        title={settings?.shipping_modal_title}
        content={settings?.shipping_modal_content}
      />
      
      {/* Custom CSS for text wrapping */}
      <style>{`
        /* Desktop: Luôn hiển thị 1 dòng, ẩn phần thừa */
        .top-banner-text-container {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Mobile (max-width: 640px): Cho phép 2 dòng */
        @media (max-width: 640px) {
          .top-banner-text-container {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 2.5rem; /* Đảm bảo không vượt quá 2 dòng */
          }
        }
        
        /* Đảm bảo link và màu chữ trong banner được áp dụng từ Rich Text Editor */
        .top-banner-text a {
          text-decoration: underline;
          font-weight: bold;
        }
        
        /* FIX: Đảm bảo màu chữ được set trong style attribute của các thẻ con (do Rich Text Editor tạo ra) được ưu tiên */
        .top-banner-text * {
          /* Không dùng color: inherit nữa */
          /* Thay vào đó, chúng ta chỉ cần đảm bảo các thẻ con không bị ghi đè bởi màu mặc định của banner */
        }
        
        /* Sử dụng !important để đảm bảo màu từ style attribute của Quill Editor được áp dụng */
        .top-banner-text [style*="color"] {
          color: var(--ql-color) !important; 
        }
        
        /* Nếu Quill không dùng var(--ql-color) mà dùng trực tiếp hex/rgb, ta cần đảm bảo nó được ưu tiên */
        .top-banner-text span[style], .top-banner-text a[style] {
            color: inherit !important; /* Kế thừa màu từ style attribute */
        }
        
        /* Cần một cách mạnh mẽ hơn để ưu tiên màu từ style attribute */
        .top-banner-text *[style*="color"] {
            color: inherit !important;
        }
      `}</style>
    </>
  );
}