import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, CreditCard, Loader2, MapPin, PlusCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthDialog } from "@/components/AuthDialog";
import { Badge } from "@/components/ui/badge";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Address States
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  
  // Manual Input Fallback
  const [manualAddress, setManualAddress] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const shipping = subtotal >= 5000000 || subtotal === 0 ? 0 : 500000;
  const total = subtotal + shipping;

  // Fetch addresses when user logs in
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    } else {
      setSavedAddresses([]);
      setSelectedAddressId(null);
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    setIsFetchingAddresses(true);
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      setSavedAddresses(data || []);
      
      // Auto select default or first address
      if (data && data.length > 0) {
        const defaultAddr = data.find(a => a.is_default) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    let finalAddress = "";
    let finalPhone = "";

    if (savedAddresses.length > 0 && selectedAddressId) {
      const selected = savedAddresses.find(a => a.id === selectedAddressId);
      finalAddress = `${selected.detail_address}, ${selected.ward}, ${selected.district}, ${selected.province} (Người nhận: ${selected.receiver_name})`;
      finalPhone = selected.phone;
    } else {
      finalAddress = manualAddress;
      finalPhone = manualPhone;
    }

    if (!finalAddress || !finalPhone) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ và số điện thoại giao hàng.");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: finalAddress,
          contact_phone: finalPhone,
          contact_email: user.email,
          status: 'pending'
        })
        .select().single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: String(item.id),
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/dat-hang-thanh-cong?id=${order.id}`);
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra: " + error.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-6 md:py-12 pb-24 lg:pb-12">
        <div className="container-luxury">
          <h1 className="text-xl md:text-3xl font-bold mb-8">Giỏ Hàng ({cartItems.length})</h1>

          {cartItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold mb-6">Giỏ hàng của bạn đang trống</h2>
              <Button asChild className="btn-hero"><Link to="/noi-that">Khám Phá Sản Phẩm</Link></Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-card rounded-xl p-4 shadow-subtle flex gap-4 border border-border/50">
                      <Link to={`/san-pham/${item.id}`} className="shrink-0">
                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/san-pham/${item.id}`}><h3 className="text-sm font-semibold hover:text-primary line-clamp-2">{item.name}</h3></Link>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-border rounded-lg bg-secondary/30">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:text-primary"><Minus className="w-4 h-4" /></button>
                            <span className="px-3 text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:text-primary"><Plus className="w-4 h-4" /></button>
                          </div>
                          <span className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-xl p-6 shadow-subtle border border-border/50">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-charcoal">
                    <MapPin className="w-5 h-5 text-primary" /> Địa chỉ giao hàng
                  </h3>

                  {!user ? (
                    <div className="p-5 bg-secondary/30 rounded-2xl border border-dashed border-border text-center">
                      <p className="text-sm text-muted-foreground mb-4">Đăng nhập để chọn địa chỉ đã lưu và nhận ưu đãi thành viên.</p>
                      <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>Đăng nhập ngay</Button>
                      <div className="mt-8 grid md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Số điện thoại *</Label>
                          <Input placeholder="Nhập SĐT nhận hàng" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Địa chỉ nhận hàng *</Label>
                          <Input placeholder="Số nhà, tên đường..." value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {isFetchingAddresses ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                      ) : savedAddresses.length > 0 ? (
                        <div className="grid gap-3">
                          {savedAddresses.map((addr) => (
                            <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                                selectedAddressId === addr.id 
                                  ? 'border-primary bg-primary/5 shadow-md' 
                                  : 'border-border hover:border-primary/40 bg-card'
                              }`}
                            >
                              <div className={`mt-1 rounded-full border-2 p-0.5 ${selectedAddressId === addr.id ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${selectedAddressId === addr.id ? 'bg-primary' : 'bg-transparent'}`} />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm text-charcoal">{addr.receiver_name}</span>
                                  {addr.is_default && <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-none uppercase tracking-widest px-1.5 py-0">Mặc định</Badge>}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">{addr.phone}</p>
                                <p className="text-xs text-charcoal leading-relaxed">{addr.detail_address}, {addr.ward}, {addr.district}, {addr.province}</p>
                              </div>
                              {selectedAddressId === addr.id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                            </div>
                          ))}
                          <Button variant="ghost" className="w-fit text-xs font-bold text-primary hover:bg-primary/5 p-0 h-auto mt-2" asChild>
                            <Link to="/tai-khoan/dia-chi">
                              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                              Thêm địa chỉ mới
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border">
                          <p className="text-sm text-muted-foreground mb-4">Bạn chưa có địa chỉ lưu sẵn.</p>
                          <Button size="sm" asChild><Link to="/tai-khoan/dia-chi">Tạo địa chỉ ngay</Link></Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Order Summary (Desktop) */}
              <div className="hidden lg:block">
                <div className="bg-card rounded-xl p-6 shadow-elevated border border-border/50 sticky top-24">
                  <h3 className="font-bold text-lg mb-6">Tóm tắt đơn hàng</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Vận chuyển</span><span>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</span></div>
                    <div className="border-t pt-4 flex justify-between text-xl font-bold text-primary"><span>Tổng cộng</span><span>{formatPrice(total)}</span></div>
                  </div>
                  <Button className="w-full mt-8 btn-hero py-6" onClick={handleCheckout} disabled={isCheckoutLoading}>
                    {isCheckoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
                    Xác nhận đặt hàng
                  </Button>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><Shield className="w-4 h-4 text-primary" /> Bảo hành chính hãng 2 năm</div>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><CreditCard className="w-4 h-4 text-primary" /> Thanh toán an toàn SSL</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
          <div className="container-luxury flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tổng cộng:</span>
              <span className="text-lg font-bold text-primary leading-none">{formatPrice(total)}</span>
            </div>
            <Button className="btn-hero flex-1 h-12 text-sm shadow-gold" onClick={handleCheckout} disabled={isCheckoutLoading}>
              {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đặt Hàng Ngay"}
            </Button>
          </div>
        </div>
      )}

      <Footer />
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </div>
  );
}