import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  Loader2, Package, ChevronRight, MapPin, 
  Plus, Trash2, Ticket, 
  Heart, ShoppingBag, X, Settings
} from "lucide-react";
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
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { OrderHistory } from "@/components/profile/OrderHistory";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProfileDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/tai-khoan"); 
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (user) {
      if (location.pathname === "/tai-khoan/dia-chi") fetchAddresses();
    }
  }, [user, location.pathname]);

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
      is_default: addresses.length === 0 
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
      case "/tai-khoan/vouchers": return "Mã giảm giá";
      case "/tai-khoan/points": return "Điểm thưởng";
      case "/tai-khoan/cai-dat": return "Cài đặt tài khoản";
      case "/yeu-thich": return `Sản phẩm yêu thích (${wishlist.length})`;
      default: return "Tổng quan tài khoản";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground mb-8 uppercase tracking-widest">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Tài khoản của tôi</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-10 text-charcoal">Quản Lý Tài Khoản</h1>
          
          <div className="grid lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1">
              <ProfileSidebar />
            </aside>

            <motion.div 
              className="lg:col-span-3" 
              key={location.pathname} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-card rounded-2xl p-6 md:p-10 shadow-subtle border border-border/40 min-h-[60vh]">
                <div className="flex items-center justify-between mb-8 border-b border-border/60 pb-6">
                  <h2 className="text-xl font-bold text-charcoal uppercase tracking-widest">{getTitle()}</h2>
                  {location.pathname === "/tai-khoan/dia-chi" && (
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="btn-hero h-10 text-[10px] shadow-gold">
                          <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-none p-8 sm:max-w-lg z-[110]">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="text-xl font-bold uppercase tracking-widest">Thêm địa chỉ giao hàng</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddAddress} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Họ tên người nhận</Label>
                              <Input name="name" placeholder="Nguyễn Văn A" required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Số điện thoại</Label>
                              <Input name="phone" placeholder="0909xxxxxx" required className="h-12 rounded-xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tỉnh / Thành</Label>
                              <Input name="province" placeholder="TP. HCM" required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quận / Huyện</Label>
                              <Input name="district" placeholder="Quận 1" required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phường / Xã</Label>
                              <Input name="ward" placeholder="Bến Nghé" required className="h-12 rounded-xl" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Địa chỉ chi tiết</Label>
                            <Input name="detail" placeholder="Số nhà, tên đường..." required className="h-12 rounded-xl" />
                          </div>
                          <Button type="submit" className="w-full btn-hero h-12 text-xs font-bold shadow-gold mt-4">Lưu địa chỉ nhận hàng</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="animate-fade-in">
                  {location.pathname === "/tai-khoan/thong-tin" && <ProfileForm />}
                  {location.pathname === "/tai-khoan/don-hang" && <OrderHistory />}

                  {location.pathname === "/yeu-thich" && (
                    wishlist.length === 0 ? (
                      <div className="text-center py-24">
                        <Heart className="w-20 h-20 mx-auto text-muted-foreground/10 mb-6" />
                        <p className="text-muted-foreground mb-8">Danh sách yêu thích của bạn đang trống.</p>
                        <Button asChild className="btn-hero h-12" variant="outline"><Link to="/noi-that">Khám phá sản phẩm ngay</Link></Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                          <div key={item.id} className="group card-luxury relative border border-border/40 hover:border-primary/30">
                            <button 
                              onClick={() => removeFromWishlist(item.id)} 
                              className="absolute top-3 right-3 z-10 p-2 bg-card/90 rounded-full hover:bg-destructive hover:text-white transition-all shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <Link to={`/san-pham/${item.slug || item.id}`} className="block aspect-square overflow-hidden bg-secondary/20">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </Link>
                            <div className="p-4">
                              <Link to={`/san-pham/${item.slug || item.id}`}><h3 className="text-sm font-bold line-clamp-1 mb-1 group-hover:text-primary transition-colors">{item.name}</h3></Link>
                              <p className="text-primary font-bold mb-4">{formatPrice(item.price)}</p>
                              <Button className="w-full h-10 text-[11px] font-bold uppercase tracking-widest" onClick={() => addToCart({...item, quantity: 1})}>
                                <ShoppingBag className="w-3.5 h-3.5 mr-2" /> Thêm vào giỏ
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {location.pathname === "/tai-khoan/vouchers" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { code: "OHOUSE500", desc: "Giảm 500.000đ cho đơn đầu tiên", expiry: "31/12/2024", type: 'cash' },
                        { code: "FREESHIP", desc: "Miễn phí vận chuyển toàn quốc", expiry: "31/12/2024", type: 'ship' },
                        { code: "GOLDVIP", desc: "Ưu đãi 10% cho khách hàng thân thiết", expiry: "Vô thời hạn", type: 'percent' },
                      ].map((v) => (
                        <div key={v.code} className="relative group overflow-hidden flex items-center gap-4 p-5 border border-dashed border-primary/40 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0 border border-primary/10"><Ticket className="w-7 h-7" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg leading-tight tracking-tight">{v.code}</p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">{v.desc}</p>
                          </div>
                          <Button variant="ghost" className="text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all h-8 px-3 rounded-lg border border-primary/20">Sao chép</Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {location.pathname === "/tai-khoan/dia-chi" && (
                    <div className="space-y-6">
                      {isLoadingAddresses ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-dashed border-border/60">
                          <MapPin className="w-16 h-16 mx-auto text-muted-foreground/10 mb-6" />
                          <p className="text-muted-foreground">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {addresses.map(addr => (
                            <div key={addr.id} className="group relative flex flex-col p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-medium transition-all duration-300">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                                    <MapPin className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-charcoal">{addr.receiver_name}</p>
                                    {addr.is_default && <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none mt-1 h-5">Mặc định</Badge>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1 mt-auto">
                                <p className="text-xs font-bold text-primary">{addr.phone}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {addr.detail_address}, {addr.ward}, {addr.district}, {addr.province}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {location.pathname === "/tai-khoan/cai-dat" && (
                    <div className="max-w-2xl">
                      <div className="mb-10">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                          <Settings className="w-5 h-5 text-primary" /> Bảo mật tài khoản
                        </h3>
                        <p className="text-sm text-muted-foreground">Thay đổi mật khẩu thường xuyên để tăng tính bảo mật cho tài khoản của bạn.</p>
                      </div>
                      <PasswordChangeForm />
                    </div>
                  )}
                  
                  <Outlet />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}