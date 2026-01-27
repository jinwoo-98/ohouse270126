import { Link } from "react-router-dom";
import { User, LogOut, ChevronRight, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { accountMenuItems } from "@/constants/header-data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeaderAccountDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAuth: () => void;
}

export function HeaderAccountDrawer({ isOpen, onOpenChange, onOpenAuth }: HeaderAccountDrawerProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Đăng xuất thất bại.");
    else {
      toast.success("Đã đăng xuất.");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col z-[100] border-l-0">
        <SheetHeader className="p-6 border-b border-border bg-card">
          <SheetTitle className="text-left font-bold text-xl uppercase tracking-widest text-charcoal">Tài Khoản</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {!user ? (
              <div className="bg-charcoal rounded-2xl p-6 text-cream shadow-elevated relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
                <Sparkles className="w-6 h-6 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">Trở thành hội viên</h3>
                <p className="text-xs text-taupe mb-5 leading-relaxed">Nhận ngay đặc quyền ưu đãi 500.000đ và tích điểm cho mọi đơn hàng.</p>
                <Button 
                  className="w-full btn-hero h-11 text-xs font-bold" 
                  onClick={() => { onOpenAuth(); onOpenChange(false); }}
                >
                  Đăng Nhập / Đăng Ký
                </Button>
              </div>
            ) : (
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-gold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-charcoal">{user.email}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Gift className="w-3 h-3" /> Thành viên Gold
                  </p>
                </div>
              </div>
            )}
          </div>

          <nav className="px-3">
            <div className="space-y-1">
              {accountMenuItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  onClick={() => onOpenChange(false)} 
                  className="flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-secondary transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">
                    {item.name}
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {user && (
          <div className="p-4 border-t border-border bg-card">
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="w-full text-destructive hover:bg-destructive/10 justify-start rounded-xl h-12"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Đăng xuất tài khoản
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}