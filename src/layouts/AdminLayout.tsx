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
  TrendingUp,
  FolderTree,
  MonitorPlay,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { motion } from "framer-motion";

const allMenuItems = [
  { id: 'dashboard', title: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { id: 'homepage', title: "Trang chủ", icon: MonitorPlay, href: "/admin/homepage" },
  { id: 'orders', title: "Đơn hàng", icon: ClipboardList, href: "/admin/orders" },
  { id: 'products', title: "Sản phẩm", icon: ShoppingBag, href: "/admin/products" },
  { id: 'categories', title: "Danh mục & Menu", icon: FolderTree, href: "/admin/categories" },
  { id: 'marketing', title: "Marketing", icon: TrendingUp, href: "/admin/marketing" },
  { id: 'reviews', title: "Đánh giá", icon: Star, href: "/admin/reviews" },
  { id: 'pages', title: "Quản lý trang", icon: Files, href: "/admin/pages" },
  { id: 'news', title: "Tin tức", icon: Newspaper, href: "/admin/news" },
  { id: 'projects', title: "Dự án", icon: Briefcase, href: "/admin/projects" },
  { id: 'design-requests', title: "Yêu cầu thiết kế", icon: LayoutGrid, href: "/admin/design-requests" },
  { id: 'messages', title: "Tin nhắn", icon: MessageSquareText, href: "/admin/messages" },
  { id: 'subscribers', title: "Người đăng ký", icon: Users, href: "/admin/subscribers" },
  { id: 'theme', title: "Giao diện", icon: Palette, href: "/admin/theme" },
  { id: 'settings', title: "Cấu hình", icon: Settings, href: "/admin/settings" },
  { id: 'team', title: "Quản lý đội ngũ", icon: ShieldCheck, href: "/admin/team" },
];

export default function AdminLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) return;
      if (!user) {
        setFetchingProfile(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .single();
      
      setUserProfile(data);
      setFetchingProfile(false);
    }

    fetchProfile();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  if (authLoading || (user && fetchingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 font-medium tracking-wide">Đang kiểm tra quyền...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl shadow-elevated p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-primary" /></div>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight uppercase">Admin Login</h1>
          </div>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} theme="light" />
        </motion.div>
      </div>
    );
  }

  const role = userProfile?.role;
  const permissions = userProfile?.permissions || {};

  // Kiểm tra quyền truy cập Admin chung
  if (role !== 'admin' && role !== 'editor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 text-center border border-destructive/20">
          <ShieldAlert className="w-20 h-20 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Truy Cập Bị Từ Chối</h1>
          <p className="text-gray-500 mb-8">Tài khoản này không có quyền quản trị.</p>
          <Button className="w-full btn-hero" onClick={() => navigate("/")}>Về Trang Chủ</Button>
        </div>
      </div>
    );
  }

  // Lọc menu dựa trên quyền
  const allowedMenuItems = allMenuItems.filter(item => {
    if (role === 'admin') return true; // Admin thấy tất cả
    if (item.id === 'dashboard') return true; // Editor luôn thấy dashboard
    if (item.id === 'team') return false; // Chỉ Admin mới thấy trang Quản lý đội ngũ
    return permissions[item.id] === true; // Editor thấy theo permissions đã cấp
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700/50">
          <div className="flex flex-col"><span className="text-xl font-bold text-primary">OHOUSE</span><span className="text-[10px] text-gray-500 uppercase tracking-widest">{role} Portal</span></div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {allowedMenuItems.map((item) => (
            <Link key={item.href} to={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href)) ? "bg-primary text-white font-bold" : "text-gray-400 hover:bg-gray-800"}`}>
              <item.icon className="w-5 h-5" /><span className="text-sm">{item.title}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50"><button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors font-bold text-xs uppercase"><LogOut className="w-5 h-5" /> Đăng xuất</button></div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-6 lg:px-8">
          <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <div className="flex items-center gap-4">
            <div className="text-right"><p className="text-sm font-bold">{user?.email}</p><Badge variant="outline" className="text-[8px] uppercase">{role}</Badge></div>
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold uppercase">{user?.email?.charAt(0)}</div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-gray-50/50"><Outlet /></main>
      </div>
    </div>
  );
}