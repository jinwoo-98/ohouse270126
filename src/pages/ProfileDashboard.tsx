import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, User } from "lucide-react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function ProfileDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to the login page (which now uses a dialog, but we redirect to the route)
      navigate("/tai-khoan"); 
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine the current section title
  const getTitle = () => {
    switch (location.pathname) {
      case "/tai-khoan/thong-tin":
        return "Thông tin cá nhân";
      case "/tai-khoan/don-hang":
        return "Đơn hàng của tôi";
      case "/tai-khoan/dia-chi":
        return "Địa chỉ giao hàng";
      case "/tai-khoan/cai-dat":
        return "Cài đặt tài khoản";
      default:
        return "Tổng quan tài khoản";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Quản Lý Tài Khoản</h1>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <ProfileSidebar />
            </aside>

            {/* Content Area */}
            <motion.div 
              className="lg:col-span-3"
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-subtle min-h-[50vh]">
                <h2 className="text-xl font-bold mb-6 border-b pb-3">{getTitle()}</h2>
                
                {/* Placeholder Content for Sub-pages */}
                {location.pathname === "/tai-khoan/thong-tin" && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Email: {user.email}</p>
                    <p className="text-muted-foreground">Tên: (Chưa cập nhật)</p>
                    <p className="text-muted-foreground">Đây là nơi bạn có thể chỉnh sửa thông tin cá nhân.</p>
                  </div>
                )}
                {location.pathname === "/tai-khoan/don-hang" && (
                  <p className="text-muted-foreground">Danh sách các đơn hàng đã đặt sẽ hiển thị tại đây.</p>
                )}
                {location.pathname === "/tai-khoan/dia-chi" && (
                  <p className="text-muted-foreground">Quản lý địa chỉ giao hàng của bạn.</p>
                )}
                {location.pathname === "/tai-khoan/cai-dat" && (
                  <p className="text-muted-foreground">Các tùy chọn cài đặt tài khoản.</p>
                )}
                {location.pathname === "/tai-khoan" && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Chào mừng, {user.email}!</p>
                    <p className="text-muted-foreground">Vui lòng chọn một mục từ thanh điều hướng bên trái.</p>
                  </div>
                )}
                
                {/* Fallback for nested routes */}
                <Outlet />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}