import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, CreditCard, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthDialog } from "@/components/AuthDialog";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const shipping = subtotal >= 5000000 || subtotal === 0 ? 0 : 500000;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!address || !phone) {
      toast.error("Vui lòng nhập đầy đủ địa chỉ và số điện thoại giao hàng.");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: address,
          contact_phone: phone,
          contact_email: user.email,
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
                  <h3 className="font-bold mb-6 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Thông tin giao hàng</h3>
                  {!user && (
                    <div className="p-4 bg-primary/5 rounded-lg text-xs font-medium text-primary border border-primary/10 mb-6">
                      ⚠️ Đăng nhập để tự động điền thông tin và tích điểm thành viên.
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-bold">Số điện thoại *</Label>
                      <Input placeholder="Nhập số điện thoại nhận hàng" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-bold">Địa chỉ chi tiết *</Label>
                      <Input placeholder="Số nhà, tên đường, phường/xã..." value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
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