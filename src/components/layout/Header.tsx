import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthDialog } from "@/components/AuthDialog";
import { OrderTrackingDialog } from "@/components/OrderTrackingDialog";
import { HeaderTopBanner } from "./header/HeaderTopBanner";
import { HeaderSearch } from "./header/HeaderSearch";
import { HeaderActions } from "./header/HeaderActions";
import { HeaderDesktopNav } from "./header/HeaderDesktopNav";
import { HeaderMobileMenu } from "./header/HeaderMobileMenu";
import { HeaderAccountDrawer } from "./header/HeaderAccountDrawer";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogo() {
      const { data } = await supabase.from('site_settings').select('logo_url').single();
      if (data?.logo_url) setLogoUrl(data.logo_url);
    }
    fetchLogo();
  }, []);

  return (
    <header className="relative z-50 bg-card shadow-sm">
      <HeaderTopBanner />

      <div className="bg-card">
        <div className="container-luxury">
          <div className="flex items-center justify-between h-12 md:h-14 gap-4">
            <HeaderSearch onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

            <Link to="/trangchu" className="flex items-center flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="OHOUSE" className="h-6 md:h-8 w-auto object-contain" />
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold tracking-tight text-charcoal leading-none">OHOUSE</span>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">Nội Thất Cao Cấp</span>
                </div>
              )}
            </Link>

            <HeaderActions 
              onOpenTracking={() => setIsTrackingDialogOpen(true)}
              onOpenAuth={() => setIsAuthDialogOpen(true)}
              onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
            />
          </div>
        </div>
      </div>

      <HeaderDesktopNav />

      <HeaderMobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenAuth={() => setIsAuthDialogOpen(true)} 
      />

      <HeaderAccountDrawer 
        isOpen={isAccountDrawerOpen} 
        onOpenChange={setIsAccountDrawerOpen} 
        onOpenAuth={() => setIsAuthDialogOpen(true)} 
      />

      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
      <OrderTrackingDialog isOpen={isTrackingDialogOpen} onClose={() => setIsTrackingDialogOpen(false)} />
    </header>
  );
}