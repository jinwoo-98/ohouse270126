import { Link } from "react-router-dom";
import { User, ShoppingBag, Package, Headset, LogOut } from "lucide-react";
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
            <DropdownMenuContent align="end" className="w-60">
              {!user ? (
                <DropdownMenuItem onClick={onOpenAuth} className="font-bold text-primary focus:text-primary">
                  <User className="w-4 h-4 mr-2" /> Đăng Nhập / Đăng Ký
                </DropdownMenuItem>
              ) : (
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Tài khoản</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              {accountMenuItems.filter(item => item.href !== "/lien-he").map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link to={item.href} className="flex items-center gap-2"><item.icon className="w-4 h-4" />{item.name}</Link>
                </DropdownMenuItem>
              ))}
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
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
        {cartCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">{cartCount}</span>}
      </Link>
    </div>
  );
}