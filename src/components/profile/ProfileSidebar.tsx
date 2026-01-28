import { Link, useLocation } from "react-router-dom";
import { User, ShoppingBag, Heart, LogOut, MapPin, Settings, Ticket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { name: "Thông tin cá nhân", href: "/tai-khoan/thong-tin", icon: User },
  { name: "Đơn hàng của tôi", href: "/tai-khoan/don-hang", icon: ShoppingBag },
  { name: "Sản phẩm yêu thích", href: "/yeu-thich", icon: Heart },
  { name: "Mã giảm giá", href: "/tai-khoan/vouchers", icon: Ticket },
  { name: "Điểm thưởng", href: "/tai-khoan/points", icon: Star },
  { name: "Địa chỉ giao hàng", href: "/tai-khoan/dia-chi", icon: MapPin },
  { name: "Cài đặt", href: "/tai-khoan/cai-dat", icon: Settings },
];

export function ProfileSidebar() {
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
      console.error("Logout error:", error);
    } else {
      toast.success("Đã đăng xuất thành công.");
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-subtle sticky top-24">
      <h3 className="font-bold text-lg mb-4">Quản Lý Tài Khoản</h3>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              location.pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-6 pt-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}