import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Package, Calendar, MapPin, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTrackingDialog({ isOpen, onClose }: OrderTrackingDialogProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }

    setIsLoading(true);
    setSearched(false);
    setOrders([]);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            price,
            product_image
          )
        `)
        .or(`contact_phone.eq.${identifier},contact_email.eq.${identifier}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      setSearched(true);
      
      if (data && data.length > 0) {
        toast.success(`Tìm thấy ${data.length} đơn hàng.`);
      } else {
        toast.info("Không tìm thấy đơn hàng nào với thông tin này.");
      }
    } catch (error: any) {
      toast.error("Lỗi tra cứu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Chờ xác nhận</Badge>;
      case 'processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Đang xử lý</Badge>;
      case 'shipped': return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Đang giao</Badge>;
      case 'delivered': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Hoàn thành</Badge>;
      case 'cancelled': return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const resetSearch = () => {
    setIdentifier("");
    setOrders([]);
    setSearched(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetSearch(); onClose(); }}>
      <DialogContent className="sm:max-w-[600px] z-[150] p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl">
        <div className="p-6 border-b border-border/50 bg-secondary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" /> Tra Cứu Đơn Hàng
            </DialogTitle>
            <DialogDescription>
              Nhập Số điện thoại hoặc Email bạn đã dùng để đặt hàng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTrackOrder} className="mt-4 flex gap-2">
            <div className="flex-1">
              <Input
                id="identifier"
                placeholder="VD: 0909xxxxxx hoặc email@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-12 bg-white"
                required
              />
            </div>
            <Button type="submit" className="btn-hero h-12 px-6 shadow-gold" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tra Cứu"}
            </Button>
          </form>
        </div>

        <ScrollArea className="max-h-[60vh] p-6 bg-white">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
              <p className="text-xs font-medium">Đang tìm kiếm dữ liệu...</p>
            </div>
          ) : searched && orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Không tìm thấy đơn hàng nào.</p>
              <Button variant="link" onClick={resetSearch} className="mt-2 text-primary">Thử lại</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-xl overflow-hidden hover:shadow-subtle transition-shadow">
                  <div className="bg-secondary/10 p-4 flex items-center justify-between border-b border-border/50">
                    <div>
                      <p className="text-xs font-bold text-primary mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      {order.order_items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-border/50">
                            <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-3 border-t border-dashed border-border/50 flex flex-col gap-2">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                        <span className="line-clamp-1">{order.shipping_address}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold pt-1">
                        <span>Tổng cộng:</span>
                        <span className="text-primary text-lg">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}