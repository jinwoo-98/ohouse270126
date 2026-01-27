import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Package, Calendar, ChevronRight, MapPin } from "lucide-react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProfileDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/tai-khoan"); 
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (user && location.pathname === "/tai-khoan/don-hang") {
      fetchOrders();
    }
  }, [user, location.pathname]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (isAuthLoading || (!user && isAuthLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTitle = () => {
    switch (location.pathname) {
      case "/tai-khoan/thong-tin": return "Thông tin cá nhân";
      case "/tai-khoan/don-hang": return "Đơn hàng của tôi";
      case "/tai-khoan/dia-chi": return "Địa chỉ giao hàng";
      case "/tai-khoan/cai-dat": return "Cài đặt tài khoản";
      default: return "Tổng quan tài khoản";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case 'processing': return <Badge variant="outline" className="text-blue-500 border-blue-500">Đang xử lý</Badge>;
      case 'shipped': return <Badge variant="outline" className="text-orange-500 border-orange-500">Đang giao</Badge>;
      case 'delivered': return <Badge variant="outline" className="text-green-500 border-green-500">Đã giao</Badge>;
      case 'cancelled': return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Quản Lý Tài Khoản</h1>
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1"><ProfileSidebar /></aside>
            <motion.div className="lg:col-span-3" key={location.pathname} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-subtle min-h-[50vh]">
                <h2 className="text-xl font-bold mb-6 border-b pb-3">{getTitle()}</h2>
                
                {location.pathname === "/tai-khoan/thong-tin" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase font-bold">Email đăng nhập</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase font-bold">Tên hiển thị</label>
                        <p className="font-medium">{user?.user_metadata?.first_name || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {location.pathname === "/tai-khoan/don-hang" && (
                  <div className="space-y-4">
                    {isLoadingOrders ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
                        <Link to="/noi-that" className="text-primary font-bold hover:underline mt-2 inline-block">Mua sắm ngay</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-border rounded-lg p-4 hover:shadow-subtle transition-shadow">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Package className="w-5 h-5" /></div>
                                <div>
                                  <p className="text-sm font-bold">Mã đơn: #{order.id.slice(0, 8).toUpperCase()}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                              </div>
                              {getStatusLabel(order.status)}
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span className="line-clamp-1">{order.shipping_address}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Tổng cộng</p>
                                <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {location.pathname === "/tai-khoan/dia-chi" && <p className="text-muted-foreground italic">Tính năng đang được cập nhật...</p>}
                {location.pathname === "/tai-khoan/cai-dat" && <p className="text-muted-foreground italic">Tính năng đang được cập nhật...</p>}
                
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