import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Package, Calendar, ChevronRight, MapPin, Plus, Trash2, ChevronDown, ChevronUp, Ticket, Star, Clock, Settings } from "lucide-react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingOrders(false);
    }
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
      case "/tai-khoan/vouchers": return "Phiếu giảm giá";
      case "/tai-khoan/points": return "Điểm thưởng";
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

                {location.pathname === "/tai-khoan/vouchers" && (
                  <div className="space-y-4">
                    {[
                      { code: "OHOUSE500", desc: "Giảm 500K cho đơn hàng từ 5tr", expiry: "31/12/2024", type: "Voucher" },
                      { code: "FREESHIP", desc: "Miễn phí vận chuyển toàn quốc", expiry: "31/12/2024", type: "Vận chuyển" },
                    ].map((v) => (
                      <div key={v.code} className="flex items-center gap-4 p-4 border border-dashed border-primary/30 rounded-xl bg-primary/5">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                          <Ticket className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg">{v.code}</p>
                          <p className="text-sm text-muted-foreground">{v.desc}</p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> Hạn dùng: {v.expiry}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Dùng ngay</Button>
                      </div>
                    ))}
                  </div>
                )}

                {location.pathname === "/tai-khoan/points" && (
                  <div className="space-y-8">
                    <div className="bg-charcoal text-cream p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-gold">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Star className="w-32 h-32" /></div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] mb-2">Điểm hiện có</p>
                      <h3 className="text-5xl font-bold text-primary flex items-center gap-3">
                        1,250 <Star className="w-8 h-8 fill-current" />
                      </h3>
                      <p className="mt-4 text-taupe text-xs">Tương đương {formatPrice(125000)} giảm giá</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold">Lịch sử tích điểm</h4>
                      <div className="space-y-2">
                        {[
                          { action: "Mua hàng đơn #OH8823", points: "+500", date: "15/10/2024" },
                          { action: "Mua hàng đơn #OH8710", points: "+750", date: "02/10/2024" },
                        ].map((h, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{h.action}</p>
                              <p className="text-xs text-muted-foreground">{h.date}</p>
                            </div>
                            <span className="font-bold text-primary">{h.points}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {location.pathname === "/tai-khoan/don-hang" && (
                  <div className="space-y-4">
                    {isLoadingOrders ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-subtle transition-shadow">
                            <div 
                              className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Package className="w-5 h-5" /></div>
                                <div>
                                  <p className="text-sm font-bold">Mã đơn: #{order.id.slice(0, 8).toUpperCase()}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                  <p className="text-xs text-muted-foreground">Tổng cộng</p>
                                  <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                                </div>
                                {getStatusLabel(order.status)}
                                {expandedOrder === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>

                            {expandedOrder === order.id && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-border bg-secondary/10">
                                <div className="p-4 space-y-4">
                                  <div className="grid md:grid-cols-2 gap-6 pb-4 border-b">
                                    <div className="space-y-2">
                                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Địa chỉ nhận hàng</p>
                                      <div className="flex gap-2">
                                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                          <p className="font-medium">{order.shipping_address}</p>
                                          <p className="text-muted-foreground">SĐT: {order.contact_phone}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái thanh toán</p>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đã thanh toán (COD)</Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Danh sách sản phẩm</p>
                                    {order.order_items?.map((item: any) => (
                                      <div key={item.id} className="flex items-center gap-4 py-2">
                                        <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg border" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold truncate">{item.product_name}</p>
                                          <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pt-4 border-t flex justify-between items-center">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link to="/ho-tro/huong-dan">Cần hỗ trợ?</Link>
                                    </Button>
                                    <div className="text-right">
                                      <span className="text-sm text-muted-foreground mr-2">Thành tiền:</span>
                                      <span className="text-xl font-bold text-primary">{formatPrice(order.total_amount)}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {location.pathname === "/tai-khoan/dia-chi" && (
                  <div className="space-y-4">
                    {isLoadingAddresses ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> : addresses.length === 0 ? (
                      <div className="text-center py-12"><MapPin className="w-12 h-12 mx-auto opacity-30 mb-4" /><p>Chưa có địa chỉ nào.</p></div>
                    ) : addresses.map(addr => (
                      <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg hover:border-primary transition-colors bg-card">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{addr.receiver_name}</span>
                            {addr.is_default && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">Mặc định</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm">{addr.detail_address}, {addr.ward}, {addr.district}, {addr.province}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {location.pathname === "/tai-khoan/cai-dat" && <PasswordChangeForm />}
                
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