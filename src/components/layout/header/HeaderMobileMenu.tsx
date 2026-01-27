import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainCategories, secondaryLinks, productCategories } from "@/constants/header-data";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export function HeaderMobileMenu({ isOpen, onClose, onOpenAuth }: HeaderMobileMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-charcoal/50 z-50 lg:hidden" onClick={onClose} />
      <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed left-0 top-0 h-full w-80 bg-card z-50 lg:hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-lg font-bold">OHOUSE</span>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 border-b border-border">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">{user.email?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user.email}</p>
                <Link to="/tai-khoan/thong-tin" className="text-[10px] text-primary font-bold underline" onClick={onClose}>Quản lý tài khoản</Link>
              </div>
            </div>
          ) : (
            <Button className="w-full btn-hero h-10 text-xs" onClick={() => { onOpenAuth(); onClose(); }}>Đăng Nhập / Đăng Ký</Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {!activeSubMenu ? (
              <motion.div key="main" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">Danh Mục</p>
                <nav className="space-y-1">
                  {mainCategories.map((item) => (
                    <button key={item.name} onClick={() => item.hasDropdown && item.dropdownKey ? setActiveSubMenu(item.dropdownKey) : (navigate(item.href), onClose())} className={`w-full flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary ${item.isHighlight ? "text-destructive font-bold" : "font-medium"}`}>
                      {item.name} {item.hasDropdown && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </button>
                  ))}
                </nav>
                <div className="mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">Tiện Ích</p>
                  <nav className="space-y-1">
                    {secondaryLinks.map((link) => (
                      <Link key={link.name} to={link.href} className="block py-3 px-3 text-sm font-medium hover:text-primary hover:bg-secondary rounded-lg" onClick={onClose}>{link.name}</Link>
                    ))}
                  </nav>
                </div>
              </motion.div>
            ) : (
              <motion.div key="sub" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <button onClick={() => setActiveSubMenu(null)} className="flex items-center gap-2 mb-6 text-primary font-bold"><ArrowLeft className="w-5 h-5" /> Quay lại</button>
                <nav className="space-y-1">
                  <Link to={`/${activeSubMenu}`} className="block py-3 px-3 text-sm font-bold text-primary bg-primary/5 rounded-lg mb-2" onClick={onClose}>Xem tất cả</Link>
                  {productCategories[activeSubMenu]?.map((sub) => (
                    <Link key={sub.name} to={sub.href} className="block py-3 px-3 text-sm font-medium hover:bg-secondary rounded-lg" onClick={onClose}>{sub.name}</Link>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}