import { Link } from "react-router-dom";
import { User, ShoppingBag, Package, Headset, LogOut, Heart, History, Ticket, Star } from "lucide-react";
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Đăng xuất thất bại.");
    else toast.success("Đã đăng xuất thành công.");
  };

  return (
    <div className="flex-1 flex items-center justify-end gap-1 max-w-[250px]">
      {/* Tra cứu đơn hàng */}
      <button className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex" onClick={onOpenTracking}>
        <Package className="w-5 h-5" />
      </button>

      <div className="flex">
        {/* Mobile Account Trigger */}
        <button className="lg:hidden p-2.5 hover:bg-secondary rounded-lg transition-colors" onClick={onOpenAccountDrawer}>
          <User className="w-5 h-5" />
        </button>

        {/* Desktop Account Dropdown */}
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2.5 h-auto rounded-lg flex"><User className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {!user ? (
                <>
                  <DropdownMenuItem onClick={onOpenAuth} className="font-bold text-primary focus:text-primary cursor-pointer p-3 rounded-xl mb-1">
                    <User className="w-4 h-4 mr-2" /> Đăng Nhập / Đăng Ký
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">Chào bạn!</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Danh sách các chức năng chính (Loại bỏ Liên hệ trên desktop menu) */}
              <div className="py-1">
                {accountMenuItems
                  .filter(item => item.href !== "/lien-he")
                  .map((item) => (
                    <DropdownMenuItem key={item.name} asChild className="cursor-pointer p-2.5 rounded-lg mb-0.5">
                      <Link to={item.href} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
              </div>

              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer p-2.5 rounded-lg mt-1">
                    <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Biểu tượng Liên hệ (Thay thế cho Yêu thích trên Desktop) */}
      <Link to="/lien-he" className="p-2.5 hover:bg-secondary rounded-lg transition-colors hidden sm:flex">
        <Headset className="w-5 h-5" />
      </Link>

      {/* Giỏ hàng */}
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