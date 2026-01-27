import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Package, Calendar, ChevronRight, MapPin, Plus, Trash2, Home } from "lucide-react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProfileDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/tai-khoan"); 
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (user) {
      if (location.pathname === "/tai-khoan/don-hang") fetchOrders();
      if (location.pathname === "/tai-khoan/dia-chi") fetchAddresses();
    }
  }, [user, location.pathname]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) { console.error(error); } finally { setIsLoadingOrders(false); }
  };

  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const { data, error } = await supabase.from('shipping_addresses').select('*').order('is_default', { ascending: false });
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) { console.error(error); } finally { setIsLoadingAddresses(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('shipping_addresses').delete().eq('id', id);
      if (error) throw error;
      toast.success("Đã xóa địa chỉ.");
      fetchAddresses();
    } catch (error) { toast.error("Không thể xóa địa chỉ."); }
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAddr = {
      user_id: user?.id,
      receiver_name: formData.get('name'),
      phone: formData.get('phone'),
      province: formData.get('province'),
      district: formData.get('district'),
      ward: formData.get('ward'),
      detail_address: formData.get('detail'),
    };

    try {
      const { error } = await supabase.from('shipping_addresses').insert(newAddr);
      if (error) throw error;
      toast.success("Đã thêm địa chỉ mới.");
      setIsAddressDialogOpen(false);
      fetchAddresses();
    } catch (error) { toast.error("Lỗi khi thêm địa chỉ."); }
  };

  if (isAuthLoading || (!user && isAuthLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
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
                <div className="flex items-center justify-between mb-6 border-b pb-3">
                  <h2 className="text-xl font-bold">{getTitle()}</h2>
                  {location.pathname === "/tai-khoan/dia-chi" && (
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Thêm địa chỉ giao hàng mới</DialogTitle></DialogHeader>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Họ tên</Label><Input name="name" required /></div>
                            <div className="space-y-1"><Label>Điện thoại</Label><Input name="phone" required /></div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Input name="province" placeholder="Tỉnh/Thành" required />
                            <Input name="district" placeholder="Quận/Huyện" required />
                            <Input name="ward" placeholder="Phường/Xã" required />
                          </div>
                          <div className="space-y-1"><Label>Địa chỉ chi tiết</Label><Input name="detail" placeholder="Số nhà, tên đường..." required /></div>
                          <Button type="submit" className="w-full">Lưu địa chỉ</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                {location.pathname === "/tai-khoan/thong-tin" && <ProfileForm />}

                {location.pathname === "/tai-khoan/don-hang" && (
                  <div className="space-y-4">
                    {isLoadingOrders ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : orders.length === 0 ? (
                      <div className="text-center py-12"><Package className="w-12 h-12 mx-auto opacity-30 mb-4" /><p>Bạn chưa có đơn hàng nào.</p></div>
                    ) : orders.map(order => (
                      <div key={order.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between mb-4">
                          <div className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</div>
                          {getStatusLabel(order.status)}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          <span className="text-primary font-bold">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {location.pathname === "/tai-khoan/dia-chi" && (
                  <div className="space-y-4">
                    {isLoadingAddresses ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : addresses.length === 0 ? (
                      <div className="text-center py-12"><MapPin className="w-12 h-12 mx-auto opacity-30 mb-4" /><p>Chưa có địa chỉ nào.</p></div>
                    ) : addresses.map(addr => (
                      <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{addr.receiver_name}</span>
                            {addr.is_default && <Badge variant="secondary" className="text-[10px]">Mặc định</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm">{addr.detail_address}, {addr.ward}, {addr.district}, {addr.province}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                
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