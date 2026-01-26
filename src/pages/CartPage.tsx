import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, CreditCard } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

const initialCartItems: CartItem[] = [
  { id: 1, name: "Sofa Góc Chữ L Vải Nhung Cao Cấp", image: categorySofa, price: 45990000, quantity: 1, variant: "Màu xám" },
  { id: 2, name: "Bàn Ăn Mặt Đá Sintered Stone 6 Ghế", image: categoryDiningTable, price: 32990000, quantity: 1, variant: "Màu trắng" },
  { id: 3, name: "Giường Ngủ Bọc Da Ý Cao Cấp", image: categoryBed, price: 38990000, quantity: 2, variant: "180x200cm" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState("");

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 5000000 ? 0 : 500000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Giỏ Hàng ({cartItems.length} sản phẩm)</h1>

          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground/50 mb-6" />
              <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm yêu thích vào giỏ hàng</p>
              <Button asChild>
                <Link to="/phong-khach">Tiếp Tục Mua Sắm</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-lg p-4 md:p-6 shadow-subtle flex gap-4"
                  >
                    <Link to={`/san-pham/${item.id}`} className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link to={`/san-pham/${item.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground mt-1">{item.variant}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg p-6 shadow-subtle sticky top-24">
                  <h2 className="text-lg font-bold mb-6">Tóm Tắt Đơn Hàng</h2>
                  
                  {/* Coupon */}
                  <div className="flex gap-2 mb-6">
                    <Input 
                      placeholder="Mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline">Áp dụng</Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Miễn phí vận chuyển cho đơn từ 5.000.000₫
                      </p>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 btn-hero">
                    Tiến Hành Thanh Toán
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4 text-primary" />
                      <span>Giao hàng toàn quốc</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Bảo hành 2 năm chính hãng</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span>Thanh toán an toàn, bảo mật</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
