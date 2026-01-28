import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";

interface HeaderMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export function HeaderMobileMenu({ isOpen, onClose, onOpenAuth }: HeaderMobileMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const { data: categoriesData } = useCategories();

  if (!isOpen) return null;

  const mainCategories = categoriesData?.mainCategories || [];
  const productCategories = categoriesData?.productCategories || {};

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-charcoal/50 z-50 lg:hidden" onClick={onClose} />
      <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed left-0 top-0 h-full w-80 bg-card z-50 lg:hidden flex flex-col shadow-elevated">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">OHOUSE</span>
            <span className="text-[7px] uppercase tracking-[0.2em] text-muted-foreground">Luxury Home Interior</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-5 border-b border-border">
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">{user.email?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.email}</p>
                <Link to="/tai-khoan/thong-tin" className="text-[10px] text-primary font-bold underline" onClick={onClose}>Quản lý tài khoản</Link>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-secondary/40 rounded-2xl border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chào quý khách</span>
              </div>
              <Button 
                className="w-full btn-hero h-11 text-xs font-bold" 
                onClick={() => { onOpenAuth(); onClose(); }}
              >
                Đăng Nhập / Đăng Ký
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!activeSubMenu ? (
              <motion.div key="main" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 px-3">Menu Chính</p>
                <nav className="space-y-1">
                  {mainCategories.map((item) => (
                    <button 
                      key={item.name} 
                      onClick={() => item.hasDropdown ? setActiveSubMenu(item.dropdownKey) : (navigate(item.href), onClose())} 
                      className={`w-full flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-secondary transition-colors ${item.isHighlight ? "text-destructive font-bold bg-destructive/5" : "font-semibold text-foreground/80"}`}
                    >
                      {item.name} {item.hasDropdown && <ChevronRight className="w-4 h-4 opacity-30" />}
                    </button>
                  ))}
                </nav>
              </motion.div>
            ) : (
              <motion.div key="sub" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <button onClick={() => setActiveSubMenu(null)} className="flex items-center gap-2 mb-6 text-primary font-bold text-sm"><ArrowLeft className="w-5 h-5" /> Quay lại</button>
                <nav className="space-y-1">
                  <Link to={`/${activeSubMenu}`} className="block py-4 px-4 text-sm font-bold text-primary bg-primary/5 rounded-2xl mb-3 border border-primary/10" onClick={onClose}>Xem tất cả</Link>
                  {productCategories[activeSubMenu]?.map((sub) => (
                    <Link key={sub.name} to={sub.href} className="block py-4 px-4 text-sm font-semibold text-foreground/80 hover:bg-secondary rounded-xl transition-colors" onClick={onClose}>{sub.name}</Link>
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