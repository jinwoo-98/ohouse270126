import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export function HeaderTopBanner() {
  const [settings, setSettings] = useState<any>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*').single();
      setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  // Xử lý bộ đếm ngược
  useEffect(() => {
    if (!settings?.top_banner_countdown) return;

    const timer = setInterval(() => {
      const end = new Date(settings.top_banner_countdown).getTime();
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
  }, [settings?.top_banner_countdown]);

  // Xử lý xoay vòng thông điệp
  const messages = settings?.top_banner_messages || [];
  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [messages]);

  if (loading) return <div className="bg-primary h-10 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-white" /></div>;
  
  // Nếu không có tin nhắn nào trong mảng JSONB, thử dùng field text cũ
  const displayMessages = messages.length > 0 ? messages : (settings?.top_banner_text ? [{ text: settings.top_banner_text, link: settings.top_banner_link }] : []);
  if (displayMessages.length === 0) return null;

  const currentMsg = displayMessages[currentMsgIndex];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="container-luxury flex items-center justify-between h-10 text-[10px] md:text-xs">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <div className="relative h-6 flex-1 max-w-[400px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMsgIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center"
              >
                <Link to={currentMsg.link || "/sale"} className="font-bold underline underline-offset-2 hover:no-underline truncate">
                  {currentMsg.text}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {settings.top_banner_countdown && (
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-1 bg-charcoal/20 px-2 py-0.5 rounded-full border border-white/10">
                {countdown.days > 0 && (
                   <>
                    <span className="font-mono font-bold">{countdown.days}d</span>
                    <span className="opacity-40 text-[8px]">:</span>
                   </>
                )}
                <span className="font-mono font-bold w-4 text-center">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="opacity-40 text-[8px]">:</span>
                <span className="font-mono font-bold w-4 text-center">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="opacity-40 text-[8px]">:</span>
                <span className="font-mono font-bold w-4 text-center text-destructive-foreground animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          )}
        </div>
        
        {settings.top_banner_shipping && (
          <div className="hidden sm:flex items-center gap-2 font-bold uppercase tracking-wider opacity-90">
            <Truck className="w-3.5 h-3.5" />
            <span>{settings.top_banner_shipping}</span>
          </div>
        )}
      </div>
    </div>
  );
}