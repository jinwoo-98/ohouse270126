import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X, Phone, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

const roomCategories = [
  { name: "Phòng Khách", href: "/phong-khach" },
  { name: "Phòng Ngủ", href: "/phong-ngu" },
  { name: "Phòng Ăn", href: "/phong-an" },
  { name: "Phòng Tắm", href: "/phong-tam" },
  { name: "Phòng Làm Việc", href: "/phong-lam-viec" },
];

const productCategories = [
  { name: "Sofa & Ghế", href: "/sofa" },
  { name: "Bàn Ăn", href: "/ban-an" },
  { name: "Bàn Trà", href: "/ban-tra" },
  { name: "Kệ Tivi", href: "/ke-tivi" },
  { name: "Giường Ngủ", href: "/giuong" },
  { name: "Bàn Làm Việc", href: "/ban-lam-viec" },
  { name: "Đèn Trang Trí", href: "/den-trang-tri" },
];

const mainNav = [
  { name: "Nội Thất", href: "/noi-that", hasDropdown: true, dropdownType: "rooms" },
  { name: "Sản Phẩm", href: "/san-pham", hasDropdown: true, dropdownType: "products" },
  { name: "Dự Án", href: "/du-an" },
  { name: "Tin Tức", href: "/tin-tuc" },
  { name: "Về OHOUSE", href: "/ve-chung-toi" },
  { name: "Sale", href: "/sale", isHighlight: true },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className="bg-charcoal text-cream">
        <div className="container-luxury flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-6">
            <a href="tel:1900888999" className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>1900 888 999</span>
            </a>
            <span className="hidden md:inline text-cream/60">|</span>
            <span className="hidden md:inline text-cream/80">Miễn phí vận chuyển cho đơn từ 5 triệu</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/showroom" className="hover:text-primary transition-colors">Showroom</Link>
            <Link to="/lien-he" className="hover:text-primary transition-colors">Liên Hệ</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-luxury">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex flex-col items-start">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-charcoal leading-none">
                OHOUSE
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                Nội Thất Cao Cấp
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNav.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.href}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded-md hover:bg-secondary ${
                    item.isHighlight ? "text-destructive" : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {/* Dropdown */}
                {item.hasDropdown && activeDropdown === item.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-full pt-2 z-50"
                  >
                    <div className="bg-card rounded-lg shadow-elevated border border-border p-2 min-w-[180px]">
                      {(item.dropdownType === "rooms" ? roomCategories : productCategories).map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block px-4 py-2.5 text-sm rounded-md hover:bg-secondary hover:text-primary transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                  >
                    <Input
                      placeholder="Tìm kiếm..."
                      className="pr-10 h-9 text-sm"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Tìm kiếm"
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            <Link to="/tai-khoan" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden md:flex">
              <User className="w-5 h-5" />
            </Link>

            <Link to="/yeu-thich" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden md:flex relative">
              <Heart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                4
              </span>
            </Link>

            <Link to="/gio-hang" className="p-2.5 hover:bg-secondary rounded-lg transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/50 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-80 bg-card z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-xl font-bold">OHOUSE</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-3">Không gian</p>
                {roomCategories.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-3 mt-6">Sản phẩm</p>
                {productCategories.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="border-t border-border mt-6 pt-6">
                  <Link
                    to="/du-an"
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dự Án Nội Thất
                  </Link>
                  <Link
                    to="/tin-tuc"
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tin Tức
                  </Link>
                  <Link
                    to="/ve-chung-toi"
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Về OHOUSE
                  </Link>
                  <Link
                    to="/sale"
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors text-destructive font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🔥 Sale
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
