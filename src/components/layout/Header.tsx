import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mainCategories = [
  { name: "Nội Thất", href: "/noi-that" },
  { name: "Phòng Khách", href: "/phong-khach" },
  { name: "Phòng Ngủ", href: "/phong-ngu" },
  { name: "Phòng Ăn", href: "/phong-an" },
  { name: "Phòng Làm Việc", href: "/phong-lam-viec" },
  { name: "Đèn Trang Trí", href: "/den-trang-tri" },
  { name: "Decor", href: "/decor" },
  { name: "Sale", href: "/sale", isHighlight: true },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className="bg-charcoal text-cream">
        <div className="container-luxury flex items-center justify-between h-10 text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:1900888999" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="w-3 h-3" />
              <span>1900 888 999</span>
            </a>
            <span className="hidden md:inline text-taupe">|</span>
            <span className="hidden md:inline">Miễn phí vận chuyển cho đơn từ 5 triệu</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/showroom" className="hover:text-primary transition-colors">Showroom</Link>
            <Link to="/tu-van" className="hover:text-primary transition-colors">Tư Vấn Thiết Kế</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-luxury">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-display font-bold tracking-tight text-charcoal">
                OHOUSE
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground -mt-1">
                Nội Thất Cao Cấp
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {mainCategories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className={`nav-link ${category.isHighlight ? "text-destructive" : ""}`}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <div className="relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                  >
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      className="pr-10"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:text-primary transition-colors"
                aria-label="Tìm kiếm"
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            <Link to="/tai-khoan" className="p-2 hover:text-primary transition-colors hidden md:block">
              <User className="w-5 h-5" />
            </Link>

            <Link to="/yeu-thich" className="p-2 hover:text-primary transition-colors hidden md:block relative">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            <Link to="/gio-hang" className="p-2 hover:text-primary transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                0
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
                <span className="text-xl font-display font-bold">OHOUSE</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {mainCategories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className={`block py-3 px-4 rounded-lg hover:bg-secondary transition-colors ${
                      category.isHighlight ? "text-destructive font-medium" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
