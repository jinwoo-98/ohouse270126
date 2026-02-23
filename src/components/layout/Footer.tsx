import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCategories } from "@/hooks/useCategories";
import { useEffect } from "react";

interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
  zalo_url: string;
  moit_url: string;
  moit_logo_url: string;
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const footerLinks = categoriesData?.footerLinks || { products: [], support: [], about: [] };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('phone, email, address, facebook_url, youtube_url, tiktok_url, zalo_url, moit_url, moit_logo_url')
      .single();
    setSettings(data as SiteSettings || null);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('subscribers').insert({ email });
      if (error) {
        if (error.code === '23505') toast.info("Email này đã đăng ký trước đó rồi.");
        else throw error;
      } else {
        toast.success("Đăng ký thành công!");
        setEmail("");
      }
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-background text-charcoal border-t border-border/40">
      {/* Newsletter Section */}
      <div className="bg-secondary/30">
        <div className="container-luxury py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-3xl font-display font-bold text-charcoal mb-2">Đăng Ký Nhận Ưu Đãi</h3>
              <p className="text-muted-foreground text-sm">Nhận ngay voucher giảm 500K cho đơn hàng đầu tiên</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-border text-charcoal placeholder:text-muted-foreground w-full md:w-80 h-12 rounded-xl"
              />
              <Button type="submit" className="btn-hero whitespace-nowrap h-12 rounded-xl shadow-gold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đăng Ký"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-luxury py-16 md:py-24">
        <div className="hidden lg:grid grid-cols-5 gap-12">
          <div className="col-span-2">
            <Link to="/trangchu" className="inline-block mb-8">
              <span className="text-3xl font-display font-bold text-charcoal">OHOUSE</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-primary font-bold mt-1">Nội Thất Cao Cấp</span>
            </Link>
            <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed text-sm">
              OHOUSE - Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, hiện đại và tinh tế cho hàng triệu gia đình.
            </p>
            <div className="space-y-4">
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors">
                  <div className="p-2 bg-secondary rounded-lg"><Phone className="w-4 h-4 text-primary" /></div> <span>{settings.phone}</span>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors">
                  <div className="p-2 bg-secondary rounded-lg"><Mail className="w-4 h-4 text-primary" /></div> <span>{settings.email}</span>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="p-2 bg-secondary rounded-lg shrink-0"><MapPin className="w-4 h-4 text-primary" /></div> <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-8 uppercase tracking-widest text-[10px] text-primary">Sản Phẩm</h4>
            {isLoadingCategories ? <div className="space-y-2"><div className="h-4 w-24 bg-secondary animate-pulse rounded" /><div className="h-4 w-32 bg-secondary animate-pulse rounded" /></div> : (
              <ul className="space-y-4 text-sm">
                {footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground hover:text-primary transition-colors">{l.name}</Link></li>)}
              </ul>
            )}
          </div>
          <div>
            <h4 className="font-display font-bold mb-8 uppercase tracking-widest text-[10px] text-primary">Hỗ Trợ</h4>
            {isLoadingCategories ? <div className="space-y-2"><div className="h-4 w-24 bg-secondary animate-pulse rounded" /><div className="h-4 w-32 bg-secondary animate-pulse rounded" /></div> : (
              <ul className="space-y-4 text-sm">
                {footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground hover:text-primary transition-colors">{l.name}</Link></li>)}
              </ul>
            )}
          </div>
          <div>
            <h4 className="font-display font-bold mb-8 uppercase tracking-widest text-[10px] text-primary">Về Chúng Tôi</h4>
            {isLoadingCategories ? <div className="space-y-2"><div className="h-4 w-24 bg-secondary animate-pulse rounded" /><div className="h-4 w-32 bg-secondary animate-pulse rounded" /></div> : (
              <div className="space-y-8">
                <ul className="space-y-4 text-sm">
                  {footerLinks.about.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground hover:text-primary transition-colors">{l.name}</Link></li>)}
                </ul>
                
                {/* Logo Bộ Công Thương ở Desktop */}
                {settings?.moit_url && (
                  <div className="pt-4">
                    <a href={settings.moit_url} target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
                      <img 
                        src={settings.moit_logo_url || "https://frontend.tikicdn.com/_desktop-frontend/static/img/footer/logo-bo-cong-thuong.png"} 
                        alt="Chứng nhận Bộ Công Thương" 
                        className="h-12 w-auto object-contain"
                      />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-10">
          <div className="text-center">
            <Link to="/trangchu" className="inline-block">
              <span className="text-3xl font-display font-bold text-charcoal">OHOUSE</span>
            </Link>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="products" className="border-border/40">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline py-4">Sản Phẩm</AccordionTrigger>
              <AccordionContent><ul className="space-y-4 pb-4">{footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground block text-sm">{l.name}</Link></li>)}</ul></AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-border/40">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline py-4">Hỗ Trợ</AccordionTrigger>
              <AccordionContent><ul className="space-y-4 pb-4">{footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground block text-sm">{l.name}</Link></li>)}</ul></AccordionContent>
            </AccordionItem>
            <AccordionItem value="about" className="border-border/40">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline py-4">Về Chúng Tôi</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4 pb-6">{footerLinks.about.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground block text-sm">{l.name}</Link></li>)}</ul>
                {/* Logo Bộ Công Thương ở Mobile (trong Accordion) */}
                {settings?.moit_url && (
                  <div className="pb-4">
                    <a href={settings.moit_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <img 
                        src={settings.moit_logo_url || "https://frontend.tikicdn.com/_desktop-frontend/static/img/footer/logo-bo-cong-thuong.png"} 
                        alt="Chứng nhận Bộ Công Thương" 
                        className="h-10 w-auto object-contain"
                      />
                    </a>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex items-center gap-6 justify-center pt-6">
            {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" /></a>}
            {settings?.tiktok_url && <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer"><Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" /></a>}
            {settings?.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer"><Youtube className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" /></a>}
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-secondary/50 border-t border-border/40">
        <div className="container-luxury py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-muted-foreground text-center md:text-left uppercase tracking-[0.2em] font-medium">© 2024 OHOUSE.VN. Nâng tầm không gian sống.</p>
        </div>
      </div>
    </footer>
  );
}