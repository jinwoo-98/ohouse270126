import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function HeaderTopBanner() {
  const [settings, setSettings] = useState<any>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*').single();
      setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

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
  }, [settings]);

  if (loading) return <div className="bg-primary h-10 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-white" /></div>;
  if (!settings?.top_banner_text) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-luxury flex items-center justify-between h-10 text-xs">
        <div className="flex items-center gap-2 md:gap-3">
          <Link to={settings.top_banner_link || "/sale"} className="font-bold underline underline-offset-2 hover:no-underline">
            {settings.top_banner_text}
          </Link>
          
          {settings.top_banner_countdown && (
            <div className="flex items-center gap-1 ml-1">
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{countdown.days}d</span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.hours).padStart(2, '0')}h</span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.minutes).padStart(2, '0')}m</span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.seconds).padStart(2, '0')}s</span>
            </div>
          )}
        </div>
        
        {settings.top_banner_shipping && (
          <div className="hidden md:flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4" />
            <span>{settings.top_banner_shipping}</span>
          </div>
        )}
      </div>
    </div>
  );
}