import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X, Truck, ChevronDown, Phone, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthDialog } from "@/components/AuthDialog";
import { OrderTrackingDialog } from "@/components/OrderTrackingDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const productCategories = {
  "phong-khach": [
    { name: "Sofa & Ghế", href: "/sofa" },
    { name: "Bàn Trà", href: "/ban-tra" },
    { name: "Kệ Tivi", href: "/ke-tivi" },
    { name: "Đèn Sàn", href: "/den-san" },
    { name: "Tủ Trang Trí", href: "/tu-trang-tri" },
  ],
  "phong-ngu": [
    { name: "Giường Ngủ", href: "/giuong" },
    { name: "Tủ Quần Áo", href: "/tu-quan-ao" },
    { name: "Bàn Trang Điểm", href: "/ban-trang-diem" },
    { name: "Đèn Ngủ", href: "/den-ngu" },
  ],
  "phong-an": [
    { name: "Bàn Ăn", href: "/ban-an" },
    { name: "Ghế Ăn", href: "/ghe-an" },
    { name: "Tủ Rượu", href: "/tu-ruou" },
    { name: "Đèn Chùm", href: "/den-chum" },
  ],
  "ban-ghe": [
    { name: "Ghế Sofa", href: "/sofa" },
    { name: "Ghế Ăn", href: "/ghe-an" },
    { name: "Ghế Thư Giãn", href: "/ghe-thu-gian" },
    { name: "Bàn Làm Việc", href: "/ban-lam-viec" },
    { name: "Bàn Console", href: "/ban-console" },
  ],
  "den-trang-tri": [
    { name: "Đèn Chùm", href: "/den-chum" },
    { name: "Đèn Sàn", href: "/den-san" },
    { name: "Đèn Bàn", href: "/den-ban" },
    { name: "Đèn Tường", href: "/den-tuong" },
  ],
  "decor": [
    { name: "Tranh Trang Trí", href: "/tranh" },
    { name: "Thảm", href: "/tham" },
    { name: "Gương", href: "/guong" },
    { name: "Bình Hoa", href: "/binh-hoa" },
  ]
};

const secondaryLinks = [
  { name: "Showroom", href: "/showroom" },
  { name: "Cảm Hứng", href: "/cam-hung" },
  { name: "Thiết Kế Miễn Phí", href: "/thiet-ke" },
  { name: "Hướng Dẫn", href: "/ho-tro/huong-dan" },
  { name: "Dự Án", href: "/du-an" },
  { name: "Hợp Tác B2B", href: "/lien-he" },
];

const mainCategories = [
  { name: "Phòng Khách", href: "/phong-khach", hasDropdown: true, dropdownKey: "phong-khach" },
  { name: "Phòng Ngủ", href: "/phong-ngu", hasDropdown: true, dropdownKey: "phong-ngu" },
  { name: "Phòng Ăn", href: "/phong-an", hasDropdown: true, dropdownKey: "phong-an" },
  { name: "Bàn & Ghế", href: "/ban-ghe", hasDropdown: true, dropdownKey: "ban-ghe" },
  { name: "Đèn", href: "/den-trang-tri", hasDropdown: true, dropdownKey: "den-trang-tri" },
  { name: "Decor", href: "/decor", hasDropdown: true, dropdownKey: "decor" },
  { name: "Bán Chạy", href: "/ban-chay", hasDropdown: false },
  { name: "Mới", href: "/moi", hasDropdown: false },
  { name: "Sale", href: "/sale", hasDropdown: false, isHighlight: true },
];

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });

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
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    } else {
      toast.success("Đã đăng xuất thành công.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      <div className="bg-primary text-primary-foreground">
        <div className="container-luxury flex items-center justify-between h-10 text-xs">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="font-semibold hidden sm:inline">Flash Sale:</span>
            <Link to="/sale" className="font-bold underline underline-offset-2 hover:no-underline">
              GIẢM ĐẾN 60% + Thêm 20%
            </Link>
            <span className="hidden md:inline">→</span>
            <span className="hidden md:inline opacity-90">Kết thúc sau</span>
            <div className="flex items-center gap-1 ml-1">
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{countdown.days}d</span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.hours).padStart(2, '0')}h</span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.minutes).padStart(2, '0')}m</span>
              <span className="bg-charcoal text-cream px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{String(countdown.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4" />
            <span>Miễn Phí Vận Chuyển</span>
          </div>
        </div>
      </div>

      <div className="bg-card">
        <div className="container-luxury">
          <div className="flex items-center justify-between h-12 md:h-14 gap-4">
            <div className="flex-1 flex items-center max-w-[250px]">
              <button className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors mr-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 relative">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm sản phẩm..." 
                  className="pl-10 pr-4 h-10 text-sm bg-secondary/50 border-0 focus-visible:ring-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-charcoal leading-none">OHOUSE</span>
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">Nội Thất Cao Cấp</span>
              </div>
            </Link>

            <div className="flex-1 flex items-center justify-end gap-1 max-w-[250px]">
              <button className="md:hidden p-2.5 hover:bg-secondary rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(true)}><Search className="w-5 h-5" /></button>
              <button className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex" onClick={() => setIsTrackingDialogOpen(true)}><Package className="w-5 h-5" /></button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2.5 h-auto rounded-lg hidden sm:flex"><User className="w-5 h-5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Tài khoản</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/tai-khoan/thong-tin">Thông tin cá nhân</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/tai-khoan/don-hang">Đơn hàng của tôi</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/yeu-thich">Sản phẩm yêu thích</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">Đăng xuất</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex" onClick={() => setIsAuthDialogOpen(true)}><User className="w-5 h-5" /></button>
              )}

              <Link to="/yeu-thich" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">{wishlistCount}</span>}
              </Link>

              <Link to="/gio-hang" className="p-2.5 hover:bg-secondary rounded-lg transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card hidden lg:block">
        <div className="container-luxury">
          <div className="flex items-center justify-center gap-6 h-9">
            {secondaryLinks.map((link, index) => (
              <React.Fragment key={link.name}>
                <Link to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
                {index < secondaryLinks.length - 1 && <span className="text-border">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card hidden lg:block">
        <div className="container-luxury">
          <nav className="flex items-center justify-center gap-1">
            {mainCategories.map((item) => (
              <div key={item.name} className="relative" onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.dropdownKey || item.name)} onMouseLeave={() => setActiveDropdown(null)}>
                <Link to={item.href} className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide transition-colors hover:text-primary ${item.isHighlight ? "text-destructive" : "text-foreground"}`}>
                  {item.name}
                </Link>
                {item.hasDropdown && activeDropdown === (item.dropdownKey || item.name) && productCategories[item.dropdownKey || item.name] && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-full z-50">
                    <div className="bg-card rounded-lg shadow-elevated border border-border p-2 min-w-[180px]">
                      {productCategories[item.dropdownKey || item.name].map((subItem) => (
                        <Link key={subItem.name} to={subItem.href} className="block px-4 py-2.5 text-sm rounded-md hover:bg-secondary hover:text-primary transition-colors" onClick={() => setActiveDropdown(null)}>
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-charcoal/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed left-0 top-0 h-full w-80 bg-card z-50 lg:hidden overflow-y-auto">
              <div className="p-4 border-b border-border flex items-center justify-between"><span className="text-xl font-bold">OHOUSE</span><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button></div>
              
              <div className="p-4 border-b border-border">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm sản phẩm..." 
                    className="pl-10 h-10 bg-secondary/50 border-0" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>

              <div className="p-4 border-b border-border flex flex-col gap-2">
                {user ? <Button variant="outline" onClick={handleLogout} className="w-full"><User className="w-4 h-4 mr-2" />Đăng xuất</Button> : <Button variant="outline" onClick={() => { setIsAuthDialogOpen(true); setIsMobileMenuOpen(false); }} className="w-full"><User className="w-4 h-4 mr-2" />Đăng nhập</Button>}
                <Button variant="outline" onClick={() => { setIsTrackingDialogOpen(true); setIsMobileMenuOpen(false); }} className="w-full"><Package className="w-4 h-4 mr-2" />Tra Cứu Đơn Hàng</Button>
              </div>
              <nav className="p-4">
                {mainCategories.map((item) => (
                  <React.Fragment key={item.name}>
                    <Link to={item.href} className={`block py-2.5 px-3 rounded-lg hover:bg-secondary transition-colors ${item.isHighlight ? "text-destructive font-medium" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>{item.name}</Link>
                  </React.Fragment>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
      <OrderTrackingDialog isOpen={isTrackingDialogOpen} onClose={() => setIsTrackingDialogOpen(false)} />
    </header>
  );
}