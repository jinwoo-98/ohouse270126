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
  ShieldCheck,
  RefreshCw,
  ListFilter,
  LayoutTemplate,
  Headset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { motion } from "framer-motion";

// Định nghĩa cấu trúc nhóm menu đã được tối ưu
const menuGroups = [
  {
    label: "Tổng Quan",
    items: [
      { id: 'dashboard', title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    ]
  },
  {
    label: "Quản Lý Bán Hàng",
    items: [
      { id: 'orders', title: "Đơn hàng", icon: ClipboardList, href: "/admin/orders" },
      { id: 'products', title: "Sản phẩm", icon: ShoppingBag, href: "/admin/products" },
      { id: 'categories', title: "Danh mục", icon: FolderTree, href: "/admin/categories" },
      { id: 'attributes', title: "Thuộc tính SP", icon: ListFilter, href: "/admin/attributes" },
      { id: 'reviews', title: "Đánh giá", icon: Star, href: "/admin/reviews" },
    ]
  },
  {
    label: "Quản Trị Nội Dung (CMS)",
    items: [
      { id: 'homepage', title: "Trang chủ", icon: MonitorPlay, href: "/admin/homepage" },
      { id: 'content', title: "Trang Nội Dung Khác", icon: LayoutTemplate, href: "/admin/content" },
    ]
  },
  {
    label: "Tương Tác & Marketing",
    items: [
      { id: 'customers', title: "Khách hàng & Tương tác", icon: Users, href: "/admin/customers" },
      { id: 'marketing', title: "Marketing & SEO", icon: TrendingUp, href: "/admin/marketing" },
    ]
  },
  {
    label: "Hệ Thống",
    items: [
      { id: 'theme', title: "Giao diện", icon: Palette, href: "/admin/theme" },
      { id: 'settings', title: "Cấu hình chung", icon: Settings, href: "/admin/settings" },
      { id: 'team', title: "Phân quyền", icon: ShieldCheck, href: "/admin/team" },
    ]
  }
];

export default function AdminLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setFetchingProfile(false);
      return;
    }

    setFetchingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        if (error.code === 'PGRST116') {
           await supabase.from('profiles').insert({ id: user.id, email: user.email, role: 'user' });
        }
      }
      setUserProfile(data || { role: 'user' });
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setFetchingProfile(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchProfile();
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
          <p className="text-gray-500 font-medium tracking-wide">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  const role = userProfile?.role;
  const permissions = userProfile?.permissions || {};

  // Kiểm tra quyền truy cập Admin chung
  if (role !== 'admin' && role !== 'editor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl shadow-elevated p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-primary" /></div>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight uppercase">Admin Login</h1>
            <p className="text-xs text-muted-foreground mt-2">Dành cho Quản trị viên & Biên tập viên</p>
          </div>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} theme="light" />
        </motion.div>
      </div>
    );
  }

  // Lọc menu dựa trên quyền và nhóm lại
  const filteredGroups = menuGroups.map(group => {
    const allowedItems = group.items.filter(item => {
      if (role === 'admin') return true;
      if (item.id === 'dashboard') return true;
      if (item.id === 'team') return false; 
      
      // Logic cho mục 'customers' (Hub mới)
      if (item.id === 'customers') {
        // Editor cần ít nhất 1 trong 4 quyền: subscribers, design-requests, messages, cooperation-requests
        return permissions['subscribers'] || permissions['design-requests'] || permissions['messages'] || permissions['cooperation-requests'];
      }
      
      // Logic cho trang content hub
      if (item.id === 'content') {
        // Editor chỉ thấy mục này nếu có ít nhất 1 quyền con (không tính homepage)
        return Object.keys(permissions).some(p => ['news', 'projects', 'pages', 'cooperation-requests'].includes(p) && permissions[p]);
      }
      
      // Các mục khác, bao gồm 'homepage', sẽ được kiểm tra quyền trực tiếp
      return permissions[item.id] === true;
    });
    return { ...group, items: allowedItems };
  }).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 flex flex-col`}>
        {/* Header Sidebar */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700/50 shrink-0">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">OHOUSE</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{role} Portal</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-6">
          {filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {group.label && (
                <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  {group.label}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link 
                    key={item.href} 
                    to={item.href} 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href)) 
                        ? "bg-primary text-white font-bold shadow-md" 
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && role === 'editor' && (
             <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mt-4">
                <p className="text-[10px] text-primary font-bold uppercase mb-2">Thông báo</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">Bạn chưa được cấp quyền truy cập mục nào. Vui lòng liên hệ Admin.</p>
             </div>
          )}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-700/50 shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors font-bold text-xs uppercase">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-6 lg:px-8 shrink-0">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <div className="hidden lg:block"></div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-charcoal">{user?.email}</p>
              <Badge variant="outline" className="text-[8px] uppercase font-bold border-primary/30 text-primary bg-primary/5">{role}</Badge>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold uppercase shadow-gold shrink-0">
              {user?.email?.charAt(0)}
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