import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Send, Mail, Phone, MapPin, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCategories } from "@/hooks/useCategories";

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
      .maybeSingle();
    setSettings(data as SiteSettings || null);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from('subscribers').insert({ email });
      
      if (error) {
        if (error.code === '23505') {
          toast.info("Email này đã có trong danh sách đăng ký của chúng tôi.");
        } else {
          throw error;
        }
      } else {
        toast.success("Đăng ký nhận tin thành công! Cảm ơn bạn.");
        setEmail("");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-background text-foreground pt-20 pb-10 overflow-hidden relative border-t border-border/40">
      {/* Hiệu ứng trang trí phía trên */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container-luxury relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-8">
            <Link to="/" className="inline-block group">
              <span className="text-3xl font-black tracking-[0.2em] text-charcoal group-hover:text-primary transition-colors duration-500">OHOUSE</span>
              <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500 mt-1" />
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm font-medium max-w-xs">
              Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, hiện đại và tinh tế.
            </p>
            <div className="flex items-center gap-4">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-border/40">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-border/40">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-border/40">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Cột 2: Sản phẩm */}
          <div className="hidden lg:block">
            <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <div className="w-4 h-px bg-primary" /> Sản Phẩm
            </h4>
            <ul className="space-y-4">
              {isLoadingCategories ? (
                <div className="space-y-2"><div className="h-4 w-24 bg-secondary animate-pulse rounded" /></div>
              ) : (
                footerLinks.products.map(l => (
                  <li key={l.name}>
                    <Link to={l.href} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {l.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="hidden lg:block">
            <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <div className="w-4 h-px bg-primary" /> Hỗ Trợ
            </h4>
            <ul className="space-y-4">
              {isLoadingCategories ? (
                <div className="space-y-2"><div className="h-4 w-24 bg-secondary animate-pulse rounded" /></div>
              ) : (
                footerLinks.support.map(l => (
                  <li key={l.name}>
                    <Link to={l.href} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {l.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Cột 4: Newsletter */}
          <div className="bg-secondary/40 p-8 rounded-3xl border border-border/60 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
            
            <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4 relative z-10">Đăng ký nhận tin</h4>
            <p className="text-muted-foreground text-xs mb-6 leading-relaxed relative z-10">
              Nhận ngay voucher giảm 500K cho đơn hàng đầu tiên và cập nhật xu hướng mới nhất.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3 relative z-10">
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="Email của bạn..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-border/60 text-charcoal placeholder:text-muted-foreground/50 h-12 rounded-xl focus:ring-primary focus:border-primary pr-12"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-primary/20 group"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Đăng ký ngay
                    <Send className="w-3 h-3 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>Bảo mật thông tin tuyệt đối</span>
            </div>
          </div>
        </div>

        {/* Mobile Accordion Menu */}
        <div className="lg:hidden mb-12">
          <Accordion type="single" collapsible className="w-full border-t border-border/40">
            <AccordionItem value="products" className="border-border/40">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-charcoal hover:no-underline py-4">Sản Phẩm</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4 pb-4">
                  {footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground block text-sm">{l.name}</Link></li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-border/40">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-charcoal hover:no-underline py-4">Hỗ Trợ</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4 pb-4">
                  {footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-muted-foreground block text-sm">{l.name}</Link></li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Thanh thông tin liên hệ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-border/40 mb-10">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Hotline</p>
              <p className="text-charcoal font-bold">{settings?.phone || "1900 123 456"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</p>
              <p className="text-charcoal font-bold">{settings?.email || "contact@ohouse.vn"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Địa chỉ</p>
              <p className="text-charcoal font-bold line-clamp-1">{settings?.address || "Quận 1, TP. Hồ Chí Minh"}</p>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền & Chứng nhận */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-muted-foreground text-[11px] font-medium text-center md:text-left">
            <p>© {new Date().getFullYear()} OHOUSE.VN. Nâng tầm không gian sống.</p>
          </div>
          
          {settings?.moit_url && (
            <a href={settings.moit_url} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
              <img 
                src={settings.moit_logo_url || "https://frontend.tikicdn.com/_desktop-frontend/static/img/footer/logo-bo-cong-thuong.png"} 
                alt="Chứng nhận Bộ Công Thương" 
                className="h-12 w-auto object-contain"
              />
            </a>
          )}
          
          <div className="flex items-center gap-6 text-muted-foreground text-[11px] font-medium">
            <Link to="/privacy" className="hover:text-primary transition-colors">Bảo mật</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản</Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}