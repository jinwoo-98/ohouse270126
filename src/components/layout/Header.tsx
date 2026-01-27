import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X, Truck, ChevronDown, Phone } from "lucide-react";
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
  { name: "Decor", href: "/decor" },
];

// Row 3: Secondary links
const secondaryLinks = [
  { name: "Showroom", href: "/showroom" },
  { name: "Cảm Hứng", href: "/cam-hung" },
  { name: "Thiết Kế Miễn Phí", href: "/thiet-ke" },
  { name: "Hướng Dẫn", href: "/huong-dan" },
  { name: "Dự Án", href: "/du-an" },
  { name: "Hợp Tác B2B", href: "/lien-he" },
];

// Row 4: Main category navigation
const mainCategories = [
  { name: "Nội Thất", href: "/noi-that", hasDropdown: true, dropdownType: "rooms" as const },
  { name: "Phòng Khách", href: "/phong-khach", hasDropdown: false },
  { name: "Phòng Ngủ", href: "/phong-ngu", hasDropdown: false },
  { name: "Phòng Ăn", href: "/phong-an", hasDropdown: false },
  { name: "Bàn & Ghế", href: "/ban-ghe", hasDropdown: true, dropdownType: "products" as const },
  { name: "Đèn", href: "/den-trang-tri", hasDropdown: false },
  { name: "Decor", href: "/decor", hasDropdown: false },
  { name: "Bán Chạy", href: "/ban-chay", hasDropdown: false },
  { name: "Mới", href: "/moi", hasDropdown: false },
  { name: "Sale", href: "/sale", hasDropdown: false, isHighlight: true },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });

  // Countdown timer
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
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Row 1: Promo Bar with Countdown (Yellow/Primary background like Homary) */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-luxury flex items-center justify-between h-10 text-xs">
          {/* Left: Promo with countdown */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="font-semibold hidden sm:inline">Flash Sale:</span>
            <Link to="/sale" className="font-bold underline underline-offset-2 hover:no-underline">
              GIẢM ĐẾN 60% + Thêm 20%
            </Link>
            <span className="hidden md:inline">→</span>
            <span className="hidden md:inline opacity-90">Kết thúc sau</span>
            <div className="flex items-center gap-1 ml-1">
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {countdown.days}d
              </span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {String(countdown.hours).padStart(2, '0')}h
              </span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {String(countdown.minutes).padStart(2, '0')}m
              </span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {String(countdown.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
          
          {/* Right: Free Shipping */}
          <div className="hidden md:flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4" />
            <span>Miễn Phí Vận Chuyển</span>
          </div>
        </div>
      </div>

      {/* Row 2: Search - Logo - Icons */}
      <div className="bg-card">
        <div className="container-luxury">
          <div className="flex items-center justify-between h-12 md:h-14 gap-4">
            {/* Left: Search */}
            <div className="flex-1 flex items-center max-w-md">
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors mr-2"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search Input - Desktop */}
              <div className="hidden md:flex items-center flex-1 relative">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm và ý tưởng..."
                  className="pl-10 pr-4 h-10 text-sm bg-secondary/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-charcoal leading-none">
                  OHOUSE
                </span>
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
                  Nội Thất Cao Cấp
                </span>
              </div>
            </Link>

            {/* Right: Icons */}
            <div className="flex-1 flex items-center justify-end gap-1 max-w-md">
              {/* Mobile Search */}
              <button
                className="md:hidden p-2.5 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link to="/tai-khoan" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex">
                <User className="w-5 h-5" />
              </Link>

              <Link to="/yeu-thich" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex relative">
                <Heart className="w-5 h-5" />
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                  4
                </span>
              </Link>

              <Link to="/gio-hang" className="p-2.5 hover:bg-secondary rounded-lg transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Secondary Links (like Visit Stores, Inspiration, etc.) */}
      <div className="bg-card hidden lg:block">
        <div className="container-luxury">
          <div className="flex items-center justify-center gap-6 h-9">
            {secondaryLinks.map((link, index) => (
              <div key={link.name} className="flex items-center gap-6">
                <Link
                  to={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
                {index < secondaryLinks.length - 1 && (
                  <span className="text-border">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Main Category Navigation */}
      <div className="bg-card hidden lg:block">
        <div className="container-luxury">
          <nav className="flex items-center justify-center gap-1">
            {mainCategories.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.href}
                  className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide transition-colors hover:text-primary ${
                    item.isHighlight ? "text-destructive" : "text-foreground"
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
                    className="absolute left-0 top-full z-50"
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
              
              {/* Mobile Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm sản phẩm..."
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {/* Mobile Secondary Links */}
              <div className="p-4 border-b border-border">
                <div className="flex flex-wrap gap-2">
                  {secondaryLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-xs text-muted-foreground hover:text-primary px-2 py-1 bg-secondary rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
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
                    to="/sale"
                    className="block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors text-destructive font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🔥 Sale
                  </Link>
                </div>
              </nav>

              {/* Mobile Contact */}
              <div className="p-4 border-t border-border mt-auto">
                <a href="tel:1900888999" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="w-4 h-4" />
                  <span>1900 888 999</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}