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
    <footer className="bg-background text-foreground overflow-hidden relative border-t border-border/40">
      {/* 1. Thanh Đăng ký nhận tin */}
      <div className="bg-secondary/30 border-b border-border/40 py-10 md:py-14">
        <div className="container-luxury">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left space-y-2">
              <h4 className="text-charcoal font-bold uppercase tracking-[0.2em] text-sm">Đăng ký nhận bản tin OHOUSE</h4>
              <p className="text-muted-foreground text-xs font-medium">Nhận ngay voucher giảm 500K cho đơn hàng đầu tiên và cập nhật xu hướng mới nhất.</p>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full lg:max-w-2xl gap-3">
              <div className="relative flex-1">
                <Input 
                  type="email" 
                  placeholder="Nhập địa chỉ email của bạn..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-border/60 text-charcoal h-12 rounded-xl focus:ring-primary pr-12"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="btn-hero h-12 px-10 rounded-xl shadow-gold shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ĐĂNG KÝ NGAY"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Nội dung chính Footer */}
      <div className="container-luxury pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Cột 1: Thương hiệu & Liên hệ */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <Link to="/" className="inline-block group">
                <span className="text-3xl font-black tracking-[0.2em] text-charcoal group-hover:text-primary transition-colors duration-500">OHOUSE</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, hiện đại và tinh tế.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Hotline</p>
                  <p className="text-charcoal font-bold text-sm">{settings?.phone || "1900 123 456"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Email</p>
                  <p className="text-charcoal font-bold text-sm">{settings?.email || "contact@ohouse.vn"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Địa chỉ</p>
                  <p className="text-charcoal font-bold text-sm leading-relaxed">{settings?.address || "Quận 1, TP. Hồ Chí Minh"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-border/40">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-border/40">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-border/40">
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
                <>
                  {footerLinks.support.map(l => (
                    <li key={l.name}>
                      <Link to={l.href} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center group">
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        {l.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/ho-tro/bao-mat" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      Chính sách bảo mật
                    </Link>
                  </li>
                  <li>
                    <Link to="/ho-tro/dieu-khoan" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      Điều khoản sử dụng
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 4: Cam kết & Chứng nhận */}
          <div className="space-y-8">
            <div className="bg-secondary/40 p-6 rounded-2xl border border-border/60">
              <h4 className="text-charcoal font-bold uppercase tracking-widest text-[10px] mb-4">Cam kết dịch vụ</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Bảo hành chính hãng 2 năm</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Giao hàng & Lắp đặt tận nơi</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Đổi trả trong 30 ngày</span>
                </li>
              </ul>
            </div>

            {settings?.moit_url && (
              <div className="pt-2">
                <a href={settings.moit_url} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity inline-block">
                  <img 
                    src={settings.moit_logo_url || "https://frontend.tikicdn.com/_desktop-frontend/static/img/footer/logo-bo-cong-thuong.png"} 
                    alt="Chứng nhận Bộ Công Thương" 
                    className="h-12 w-auto object-contain"
                  />
                </a>
              </div>
            )}
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
                  <li><Link to="/ho-tro/bao-mat" className="text-muted-foreground block text-sm">Chính sách bảo mật</Link></li>
                  <li><Link to="/ho-tro/dieu-khoan" className="text-muted-foreground block text-sm">Điều khoản sử dụng</Link></li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Dòng bản quyền */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-border/40">
          <div className="text-muted-foreground text-[11px] font-medium text-center md:text-left">
            <p>© {new Date().getFullYear()} OHOUSE.VN. Nâng tầm không gian sống.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}