import { useNavigate, Link } from "react-router-dom";
import { User, ShoppingBag, Package, Headset, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { accountMenuItems } from "@/constants/header-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeaderActionsProps {
  onOpenTracking: () => void;
  onOpenAuth: () => void;
  onOpenAccountDrawer: () => void;
}

export function HeaderActions({ onOpenTracking, onOpenAuth, onOpenAccountDrawer }: HeaderActionsProps) {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Đăng xuất thất bại.");
    else toast.success("Đã đăng xuất thành công.");
  };

  const handleItemClick = (item: any) => {
    if (item.requiresAuth && !user) {
      onOpenAuth();
    } else {
      navigate(item.href);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-end gap-1 max-w-[250px]">
      <button className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex" onClick={onOpenTracking}>
        <Package className="w-5 h-5" />
      </button>

      <div className="flex">
        <button className="lg:hidden p-2.5 hover:bg-secondary rounded-lg transition-colors" onClick={onOpenAccountDrawer}>
          <User className="w-5 h-5" />
        </button>

        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2.5 h-auto rounded-lg flex"><User className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-3 rounded-2xl shadow-elevated border-border/40">
              {!user ? (
                <div className="p-4 bg-secondary/30 rounded-xl mb-4 text-center border border-border/50">
                  <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Chào mừng quý khách</p>
                  <Button onClick={onOpenAuth} className="w-full btn-hero h-10 text-[11px] shadow-gold mb-3">Đăng Nhập / Đăng Ký</Button>
                  <p className="text-[10px] text-muted-foreground italic">Đăng ký thành viên để nhận ưu đãi 500K</p>
                </div>
              ) : (
                <DropdownMenuLabel className="font-normal p-3 bg-primary/5 rounded-xl mb-3 border border-primary/10">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Thành viên OHOUSE</p>
                    <p className="text-sm font-bold truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
              )}

              <div className="space-y-0.5">
                {accountMenuItems
                  .filter(item => item.href !== "/lien-he")
                  .map((item) => (
                    <DropdownMenuItem 
                      key={item.name} 
                      onSelect={(e) => {
                        e.preventDefault();
                        handleItemClick(item);
                      }}
                      className="cursor-pointer p-2.5 rounded-xl transition-all focus:bg-secondary group"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-focus:bg-primary group-focus:text-primary-foreground transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </div>

              {user && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer p-2.5 rounded-xl">
                    <LogOut className="w-4 h-4 mr-2" /> Đăng xuất tài khoản
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Link to="/lien-he" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex">
        <Headset className="w-5 h-5" />
      </Link>

      <Link to="/gio-hang" className="p-2.5 hover:bg-secondary rounded-lg transition-colors relative">
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold px-1 border-2 border-card">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}