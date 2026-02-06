"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Calendar, ChevronDown, ChevronUp, RotateCw, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200">Chờ xác nhận</Badge>;
    case 'processing': return <Badge variant="outline" className="text-blue-500 border-blue-500">Đang xử lý</Badge>;
    case 'shipped': return <Badge variant="outline" className="text-orange-500 border-orange-500">Đang giao</Badge>;
    case 'delivered': return <Badge variant="outline" className="text-green-500 border-green-500">Đã giao</Badge>;
    case 'cancelled': return <Badge variant="destructive">Đã hủy</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

export function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải lịch sử đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = (items: any[]) => {
    items.forEach(item => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        image: item.product_image,
        quantity: item.quantity,
        slug: item.product_id
      });
    });
    toast.success(`Đã thêm ${items.length} sản phẩm vào giỏ hàng.`);
    navigate("/gio-hang");
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-dashed border-border/60">
        <Package className="w-16 h-16 mx-auto text-muted-foreground/20 mb-6" />
        <p className="text-muted-foreground font-medium">Bạn chưa có đơn hàng nào tại OHOUSE.</p>
        <Button asChild className="mt-8 btn-hero h-11" variant="outline"><a href="/noi-that">Sắm đồ ngay</a></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="border border-border/60 rounded-2xl overflow-hidden bg-card hover:shadow-medium transition-all duration-300">
          <div 
            className="p-5 cursor-pointer flex flex-wrap items-center justify-between gap-6"
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-charcoal">Đơn hàng #{order.id.slice(0, 8).toUpperCase()}</span>
                  {getStatusLabel(order.status)}
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                  <span className="flex items-center gap-1.5 font-bold text-primary">{order.order_items?.length || 0} sản phẩm</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tổng cộng</p>
                <p className="text-lg font-bold text-primary">{formatPrice(order.total_amount)}</p>
              </div>
              <div className={`p-2 rounded-full transition-colors ${expandedOrder === order.id ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                {expandedOrder === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expandedOrder === order.id && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/40 bg-secondary/10 overflow-hidden"
              >
                <div className="p-6 md:p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Thông tin nhận hàng</h4>
                      <div className="flex gap-4 p-4 bg-white rounded-xl shadow-subtle border border-border/40">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-bold text-charcoal mb-1">Địa chỉ giao hàng</p>
                          <p className="text-muted-foreground leading-relaxed">{order.shipping_address}</p>
                          <p className="mt-3 font-bold text-charcoal">SĐT: <span className="text-primary">{order.contact_phone}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Thanh toán</h4>
                      <div className="p-4 bg-white rounded-xl shadow-subtle border border-border/40 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-charcoal mb-1">Hình thức</p>
                          <p className="text-xs text-muted-foreground font-medium">Thanh toán khi nhận hàng (COD)</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3">Đã duyệt</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Chi tiết sản phẩm</h4>
                    <div className="bg-white rounded-2xl shadow-subtle border border-border/40 overflow-hidden divide-y divide-border/40">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-5 p-4 group">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary/30 border border-border/40 shrink-0">
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-charcoal mb-1 truncate">{item.product_name}</p>
                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                              <span>Số lượng: <span className="text-charcoal font-bold">{item.quantity}</span></span>
                              <span>•</span>
                              <span>Giá: {formatPrice(item.price)}</span>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-primary shrink-0">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button variant="outline" className="flex-1 sm:flex-none h-11 text-[11px] font-bold uppercase tracking-widest border-charcoal/20" asChild>
                        <a href="/ho-tro/huong-dan">Hỗ trợ</a>
                      </Button>
                      <Button 
                        className="flex-1 sm:flex-none btn-hero h-11 shadow-gold text-[11px]" 
                        onClick={() => handleReorder(order.order_items)}
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-2" /> Mua lại đơn này
                      </Button>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-3">Tổng cộng thanh toán:</span>
                      <span className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}