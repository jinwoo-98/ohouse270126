import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Palette, 
  LogOut,
  Menu,
  X,
  Loader2,
  ShieldAlert,
  ClipboardList,
  LayoutGrid,
  MessageSquareText,
  Lock,
  Files,
  Newspaper,
  Briefcase,
  Star,
  Users,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { motion } from "framer-motion";

const menuItems = [
  { title: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { title: "Đơn hàng", icon: ClipboardList, href: "/admin/orders" },
  { title: "Sản phẩm", icon: ShoppingBag, href: "/admin/products" },
  { title: "Marketing", icon: TrendingUp, href: "/admin/marketing" },
  { title: "Đánh giá", icon: Star, href: "/admin/reviews" },
  { title: "Quản lý trang", icon: Files, href: "/admin/pages" },
  { title: "Tin tức", icon: Newspaper, href: "/admin/news" },
  { title: "Dự án", icon: Briefcase, href: "/admin/projects" },
  { title: "Yêu cầu thiết kế", icon: LayoutGrid, href: "/admin/design-requests" },
  { title: "Tin nhắn", icon: MessageSquareText, href: "/admin/messages" },
  { title: "Người đăng ký", icon: Users, href: "/admin/subscribers" },
  { title: "Giao diện", icon: Palette, href: "/admin/theme" },
  { title: "Cấu hình", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (authLoading) return;
      
      if (!user) {
        setIsAdmin(null);
        setCheckingRole(false);
        return;
      }

      setCheckingRole(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || data?.role !== 'admin') {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    }

    checkAdminRole();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(null);
    navigate("/admin");
  };

  if (authLoading || (user && checkingRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 font-medium tracking-wide">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-elevated p-8 md:p-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight uppercase">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-2 font-medium">Hệ thống quản trị OHOUSE.VN</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    inputBorderRadius: '12px',
                  },
                },
              },
            }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email quản trị',
                  password_label: 'Mật khẩu',
                  button_label: 'Đăng nhập hệ thống',
                }
              }
            }}
          />
          
          <div className="mt-8 text-center">
            <Link to="/" className="text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">
              Quay lại trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 text-center border border-destructive/20">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-display">Truy Cập Bị Từ Chối</h1>
          <p className="text-gray-500 mb-8 leading-relaxed font-medium">
            Tài khoản <strong>{user?.email}</strong> không có quyền quản trị viên.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full btn-hero h-12 shadow-gold" onClick={() => navigate("/")}>Về Trang Chủ</Button>
            <Button variant="ghost" className="h-12 font-bold text-xs uppercase tracking-widest" onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700/50">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wider text-primary">OHOUSE</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Administrator</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-bold shadow-gold" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <button 
            className="lg:hidden p-2.5 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.email}</p>
              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-gold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}