import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCategories } from "@/hooks/useCategories";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const footerLinks = categoriesData?.footerLinks || { products: [], support: [], about: [] };

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
    <footer className="bg-charcoal text-cream">
      {/* Newsletter (Bỏ border-b) */}
      <div className="bg-white/5">
        <div className="container-luxury py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-3xl font-display font-semibold mb-2">Đăng Ký Nhận Ưu Đãi</h3>
              <p className="text-taupe text-sm">Nhận ngay voucher giảm 500K cho đơn hàng đầu tiên</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-walnut/20 border-none text-cream placeholder:text-taupe w-full md:w-80 h-12 rounded-xl"
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
              <span className="text-3xl font-display font-bold">OHOUSE</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-primary font-bold mt-1">Nội Thất Cao Cấp</span>
            </Link>
            <p className="text-taupe mb-8 max-w-sm leading-relaxed text-sm">
              OHOUSE - Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, hiện đại và tinh tế cho hàng triệu gia đình.
            </p>
            <div className="space-y-4">
              <a href="tel:1900888999" className="flex items-center gap-4 text-taupe hover:text-primary transition-colors">
                <div className="p-2 bg-white/5 rounded-lg"><Phone className="w-4 h-4" /></div> <span>1900 888 999</span>
              </a>
              <a href="mailto:info@ohouse.vn" className="flex items-center gap-4 text-taupe hover:text-primary transition-colors">
                <div className="p-2 bg-white/5 rounded-lg"><Mail className="w-4 h-4" /></div> <span>info@ohouse.vn</span>
              </a>
              <div className="flex items-start gap-4 text-taupe">
                <div className="p-2 bg-white/5 rounded-lg shrink-0"><MapPin className="w-4 h-4" /></div> <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-8 uppercase tracking-widest text-[10px] text-primary">Sản Phẩm</h4>
            {isLoadingCategories ? <div className="space-y-2"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></div> : (
              <ul className="space-y-4 text-sm">
                {footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-taupe hover:text-primary transition-colors">{l.name}</Link></li>)}
              </ul>
            )}
          </div>
          <div>
            <h4 className="font-display font-bold mb-8 uppercase tracking-widest text-[10px] text-primary">Hỗ Trợ</h4>
            {isLoadingCategories ? <div className="space-y-2"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></div> : (
              <ul className="space-y-4 text-sm">
                {footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-taupe hover:text-primary transition-colors">{l.name}</Link></li>)}
              </ul>
            )}
          </div>
          <div>
            <h4 className="font-display font-bold mb-8 uppercase tracking-widest text-[10px] text-primary">Về Chúng Tôi</h4>
            {isLoadingCategories ? <div className="space-y-2"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></div> : (
              <ul className="space-y-4 text-sm">
                {footerLinks.about.map(l => <li key={l.name}><Link to={l.href} className="text-taupe hover:text-primary transition-colors">{l.name}</Link></li>)}
              </ul>
            )}
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-10">
          <div className="text-center">
            <Link to="/trangchu" className="inline-block"><span className="text-3xl font-display font-bold">OHOUSE</span></Link>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="products" className="border-none">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline py-4">Sản Phẩm</AccordionTrigger>
              <AccordionContent><ul className="space-y-4 pb-4">{footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-taupe block text-sm">{l.name}</Link></li>)}</ul></AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-none">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline py-4">Hỗ Trợ</AccordionTrigger>
              <AccordionContent><ul className="space-y-4 pb-4">{footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-taupe block text-sm">{l.name}</Link></li>)}</ul></AccordionContent>
            </AccordionItem>
            <AccordionItem value="about" className="border-none">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline py-4">Về Chúng Tôi</AccordionTrigger>
              <AccordionContent><ul className="space-y-4 pb-4">{footerLinks.about.map(l => <li key={l.name}><Link to={l.href} className="text-taupe block text-sm">{l.name}</Link></li>)}</ul></AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex items-center gap-6 justify-center pt-6">
            <Facebook className="w-5 h-5 text-taupe hover:text-primary cursor-pointer" />
            <Instagram className="w-5 h-5 text-taupe hover:text-primary cursor-pointer" />
            <Youtube className="w-5 h-5 text-taupe hover:text-primary cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Copyright (Bỏ border-t) */}
      <div className="bg-black/20">
        <div className="container-luxury py-8">
          <p className="text-[10px] text-taupe text-center uppercase tracking-[0.2em] font-medium">© 2024 OHOUSE.VN. Nâng tầm không gian sống.</p>
        </div>
      </div>
    </footer>
  );
}