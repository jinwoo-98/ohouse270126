import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: address,
          contact_phone: phone,
          contact_email: user.email,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: String(item.id),
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại OHOUSE.");
      clearCart();
      navigate("/tai-khoan/don-hang");
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra: " + error.message);
      console.error(error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Giỏ Hàng ({cartItems.length} sản phẩm)</h1>

          {cartItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground/50 mb-6" />
              <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
              <Button asChild className="mt-4"><Link to="/noi-that">Tiếp Tục Mua Sắm</Link></Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-card rounded-lg p-4 md:p-6 shadow-subtle flex gap-4">
                      <Link to={`/san-pham/${item.id}`} className="flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4">
                          <Link to={`/san-pham/${item.id}`}><h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">{item.name}</h3></Link>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-border rounded-lg">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
                            <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
                          </div>
                          <p className="text-lg font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Shipping Info Form */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg p-6 shadow-subtle space-y-4">
                  <h2 className="text-lg font-bold border-b pb-2">Thông Tin Giao Hàng</h2>
                  {!user && (
                    <div className="p-3 bg-secondary/50 rounded-lg text-sm mb-4">
                      Vui lòng <button onClick={() => setShowAuthDialog(true)} className="text-primary font-bold underline">đăng nhập</button> để hoàn tất đặt hàng.
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại nhận hàng *</Label>
                      <Input id="phone" placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                      <Input id="address" placeholder="Số nhà, tên đường, phường/xã..." value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg p-6 shadow-subtle sticky top-24">
                  <h2 className="text-lg font-bold mb-6">Tóm Tắt Đơn Hàng</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</span></div>
                    <div className="border-t border-border pt-3 flex justify-between text-lg font-bold"><span>Tổng cộng</span><span className="text-primary">{formatPrice(total)}</span></div>
                  </div>
                  <Button className="w-full mt-6 btn-hero" onClick={handleCheckout} disabled={isCheckoutLoading}>
                    {isCheckoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {user ? "Đặt Hàng Ngay" : "Đăng Nhập Để Thanh Toán"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3"><Truck className="w-4 h-4 text-primary" /><span>Giao hàng toàn quốc</span></div>
                    <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-primary" /><span>Bảo hành 2 năm</span></div>
                    <div className="flex items-center gap-3"><CreditCard className="w-4 h-4 text-primary" /><span>Thanh toán bảo mật</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </div>
  );
}