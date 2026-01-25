import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    { name: "Liên Hệ Hợp Tác", href: "/hop-tac" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Newsletter Section */}
      <div className="border-b border-walnut/30">
        <div className="container-luxury py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-display font-semibold mb-2">
                Đăng Ký Nhận Ưu Đãi
              </h3>
              <p className="text-taupe">
                Nhận ngay voucher giảm 500K cho đơn hàng đầu tiên
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="bg-walnut/20 border-walnut/30 text-cream placeholder:text-taupe w-full md:w-80"
              />
              <Button className="btn-hero whitespace-nowrap">
                Đăng Ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-luxury py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-display font-bold">OHOUSE</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-taupe mt-1">
                Nội Thất Cao Cấp
              </span>
            </Link>
            <p className="text-taupe mb-6 max-w-sm">
              OHOUSE - Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, 
              hiện đại và tinh tế cho ngôi nhà của bạn.
            </p>
            <div className="space-y-3">
              <a href="tel:19008889999" className="flex items-center gap-3 text-taupe hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                <span>1900 888 999</span>
              </a>
              <a href="mailto:info@ohouse.vn" className="flex items-center gap-3 text-taupe hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@ohouse.vn</span>
              </a>
              <div className="flex items-start gap-3 text-taupe">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-semibold mb-4">Sản Phẩm</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-taupe hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-taupe hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-display font-semibold mb-4">Về Chúng Tôi</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-taupe hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-walnut/30">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-taupe text-center md:text-left">
              © 2024 OHOUSE.VN. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-taupe hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-taupe hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-taupe hover:text-primary transition-colors" aria-label="Youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
