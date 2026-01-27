import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

export function HeaderTopBanner() {
  const [countdown, setCountdown] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-luxury flex items-center justify-between h-10 text-xs">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="font-semibold hidden sm:inline">Flash Sale:</span>
          <Link to="/sale" className="font-bold underline underline-offset-2 hover:no-underline">
            GIẢM ĐẾN 60% + Thêm 20%
          </Link>
          <span className="hidden md:inline">→</span>
          <div className="flex items-center gap-1 ml-1">
            <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{countdown.days}d</span>
            <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.hours).padStart(2, '0')}h</span>
            <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.minutes).padStart(2, '0')}m</span>
            <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.seconds).padStart(2, '0')}s</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 font-medium">
          <Truck className="w-4 h-4" />
          <span>Miễn Phí Vận Chuyển</span>
        </div>
      </div>
    </div>
  );
}