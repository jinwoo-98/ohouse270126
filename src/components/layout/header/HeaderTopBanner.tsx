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

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="container-luxury flex items-center justify-between h-10 text-[10px] md:text-xs">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <div className="relative h-6 flex-1 max-w-[450px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMsgIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center gap-3"
              >
                <Link to={currentMsg.link || "/sale"} className="font-bold underline underline-offset-2 hover:no-underline truncate">
                  {currentMsg.text}
                </Link>

                {hasCountdown && (
                  <div className="flex items-center gap-1 shrink-0 animate-fade-in">
                    <div className="flex items-center gap-0.5">
                      {countdown.days > 0 && (
                        <>
                          <div className="bg-black text-white px-1.5 py-0.5 rounded-sm font-mono font-bold min-w-[20px] text-center border border-white/10">
                            {countdown.days}d
                          </div>
                          <span className="text-[8px] font-bold mx-0.5">:</span>
                        </>
                      )}
                      <div className="bg-black text-white px-1 py-0.5 rounded-sm font-mono font-bold min-w-[18px] text-center border border-white/10">
                        {String(countdown.hours).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] font-bold mx-0.5">:</span>
                      <div className="bg-black text-white px-1 py-0.5 rounded-sm font-mono font-bold min-w-[18px] text-center border border-white/10">
                        {String(countdown.minutes).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] font-bold mx-0.5">:</span>
                      <div className="bg-black text-white px-1 py-0.5 rounded-sm font-mono font-bold min-w-[18px] text-center border border-white/10 animate-pulse">
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
          <div className="hidden sm:flex items-center gap-2 font-bold uppercase tracking-wider opacity-90">
            <Truck className="w-3.5 h-3.5" />
            <span>{settings.top_banner_shipping}</span>
          </div>
        )}
      </div>
    </div>
  );
}