import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const footerLinks = {
  products: [
    { name: "Phòng Khách", href: "/phong-khach" },
    { name: "Phòng Ngủ", href: "/phong-ngu" },
    { name: "Phòng Ăn", href: "/phong-an" },
    { name: "Phòng Làm Việc", href: "/phong-lam-viec" },
    { name: "Đèn Trang Trí", href: "/den-trang-tri" },
    { name: "Decor & Phụ Kiện", href: "/decor" },
  ],
  support: [
    { name: "Hướng Dẫn Mua Hàng", href: "/huong-dan" },
    { name: "Chính Sách Đổi Trả", href: "/doi-tra" },
    { name: "Chính Sách Bảo Hành", href: "/bao-hanh" },
    { name: "Hình Thức Thanh Toán", href: "/thanh-toan" },
    { name: "Chính Sách Vận Chuyển", href: "/van-chuyen" },
    { name: "Câu Hỏi Thường Gặp", href: "/faq" },
  ],
  about: [
    { name: "Về OHOUSE", href: "/ve-chung-toi" },
    { name: "Tuyển Dụng", href: "/tuyen-dung" },
    { name: "Tin Tức", href: "/tin-tuc" },
    { name: "Dự Án Nội Thất", href: "/du-an" },
    { name: "Liên Hệ Hợp Tác", href: "/lien-he" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        toast.success("Đăng ký thành công! OHOUSE sẽ gửi ưu đãi đến bạn.");
        setEmail("");
      }
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-charcoal text-cream">
      {/* Newsletter */}
      <div className="border-b border-walnut/30">
        <div className="container-luxury py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-2">Đăng Ký Nhận Ưu Đãi</h3>
              <p className="text-taupe text-sm">Nhận ngay voucher giảm 500K cho đơn hàng đầu tiên</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-walnut/20 border-walnut/30 text-cream placeholder:text-taupe w-full md:w-80 h-11"
              />
              <Button type="submit" className="btn-hero whitespace-nowrap h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đăng Ký"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-luxury py-10 md:py-16">
        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-display font-bold">OHOUSE</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-taupe mt-1">Nội Thất Cao Cấp</span>
            </Link>
            <p className="text-taupe mb-6 max-w-sm leading-relaxed">
              OHOUSE - Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, hiện đại và tinh tế.
            </p>
            <div className="space-y-3">
              <a href="tel:1900888999" className="flex items-center gap-3 text-taupe hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> <span>1900 888 999</span>
              </a>
              <a href="mailto:info@ohouse.vn" className="flex items-center gap-3 text-taupe hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> <span>info@ohouse.vn</span>
              </a>
              <div className="flex items-start gap-3 text-taupe">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" /> <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-6 uppercase tracking-wider text-xs text-primary">Sản Phẩm</h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-taupe hover:text-primary transition-colors">{l.name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-6 uppercase tracking-wider text-xs text-primary">Hỗ Trợ</h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-taupe hover:text-primary transition-colors">{l.name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-6 uppercase tracking-wider text-xs text-primary">Về Chúng Tôi</h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.about.map(l => <li key={l.name}><Link to={l.href} className="text-taupe hover:text-primary transition-colors">{l.name}</Link></li>)}
            </ul>
          </div>
        </div>

        {/* Mobile View - Accordion Style */}
        <div className="lg:hidden space-y-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-display font-bold">OHOUSE</span>
            </Link>
          </div>

          <Accordion type="single" collapsible className="w-full border-t border-walnut/20">
            <AccordionItem value="products" className="border-walnut/20">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-primary hover:no-underline">Sản Phẩm</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4 pt-2 pb-4">
                  {footerLinks.products.map(l => <li key={l.name}><Link to={l.href} className="text-taupe block">{l.name}</Link></li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-walnut/20">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-primary hover:no-underline">Hỗ Trợ</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4 pt-2 pb-4">
                  {footerLinks.support.map(l => <li key={l.name}><Link to={l.href} className="text-taupe block">{l.name}</Link></li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="about" className="border-walnut/20">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-primary hover:no-underline">Về Chúng Tôi</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4 pt-2 pb-4">
                  {footerLinks.about.map(l => <li key={l.name}><Link to={l.href} className="text-taupe block">{l.name}</Link></li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4 justify-center">
              <a href="tel:1900888999" className="p-3 bg-walnut/10 rounded-full text-primary"><Phone className="w-5 h-5" /></a>
              <a href="mailto:info@ohouse.vn" className="p-3 bg-walnut/10 rounded-full text-primary"><Mail className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-walnut/10 rounded-full text-primary"><MapPin className="w-5 h-5" /></a>
            </div>
            <p className="text-center text-xs text-taupe px-4">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-walnut/20 bg-black/10">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] md:text-xs text-taupe text-center uppercase tracking-widest">© 2024 OHOUSE.VN. All Rights Reserved.</p>
            <div className="flex items-center gap-6">
              <Facebook className="w-4 h-4 text-taupe hover:text-primary transition-colors cursor-pointer" />
              <Instagram className="w-4 h-4 text-taupe hover:text-primary transition-colors cursor-pointer" />
              <Youtube className="w-4 h-4 text-taupe hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}