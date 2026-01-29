import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Filter,
  Loader2,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Nếu đang cập nhật chính đơn này thì bỏ qua
    if (isUpdatingId === orderId) return;

    setIsUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Cập nhật đơn hàng thành công: ${newStatus}`);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error("Không thể lưu trạng thái: " + error.message);
      // Re-fetch để đồng bộ lại dữ liệu chuẩn từ server
      fetchOrders();
    } finally {
      setIsUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Chờ xác nhận</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Đang xử lý</Badge>;
      case 'shipped': return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100">Đang giao</Badge>;
      case 'delivered': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Đã hoàn thành</Badge>;
      case 'cancelled': return <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.contact_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-muted-foreground text-sm">Theo dõi và vận hành quy trình xử lý đơn hàng của hệ thống.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo mã đơn, SĐT, Email..." 
              className="pl-10 h-11 bg-white rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48 h-11 bg-white rounded-xl font-bold text-xs uppercase tracking-widest border-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  <SelectValue placeholder="Lọc trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tất cả đơn hàng</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="shipped">Đang giao hàng</SelectItem>
                <SelectItem value="delivered">Đã hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy đơn</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                className="text-xs font-bold text-muted-foreground hover:text-destructive h-11 px-4"
              >
                <X className="w-4 h-4 mr-1.5" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">Không tìm thấy đơn hàng nào.</td></tr>
              ) : filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className={`hover:bg-gray-50/80 transition-colors group ${expandedOrderId === order.id ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-mono text-[11px] font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-charcoal">{order.contact_email}</p>
                      <p className="text-xs text-muted-foreground">{order.contact_phone}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-charcoal">{formatPrice(order.total_amount)}</td>
                    <td className="px-6 py-4 text-center">
                      {isUpdatingId === order.id ? (
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-primary animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> ĐANG LƯU...
                        </div>
                      ) : (
                        getStatusBadge(order.status)
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select 
                          value={order.status} 
                          onValueChange={(val) => updateOrderStatus(order.id, val)}
                          disabled={isUpdatingId === order.id}
                        >
                          <SelectTrigger className="w-36 h-9 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white shadow-sm border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="pending">Chờ xác nhận</SelectItem>
                            <SelectItem value="processing">Đang xử lý</SelectItem>
                            <SelectItem value="shipped">Đang giao</SelectItem>
                            <SelectItem value="delivered">Hoàn thành</SelectItem>
                            <SelectItem value="cancelled">Hủy đơn</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 rounded-lg transition-all ${expandedOrderId === order.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-secondary'}`}
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        >
                          {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  
                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan={5} className="p-0 border-none">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gray-50/50 border-b border-border shadow-inner"
                          >
                            <div className="p-6 grid md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-primary" /> Thông tin giao hàng
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-3">
                                  <p className="text-sm text-charcoal leading-relaxed">{order.shipping_address}</p>
                                  <p className="text-sm font-bold">SĐT: {order.contact_phone}</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                  <Package className="w-3 h-3 text-primary" /> Sản phẩm ({order.order_items?.length || 0})
                                </h4>
                                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                                  {order.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4">
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                        <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-charcoal truncate">{item.product_name}</p>
                                        <p className="text-[10px] text-muted-foreground">x{item.quantity} • {formatPrice(item.price)}</p>
                                      </div>
                                      <p className="text-xs font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}