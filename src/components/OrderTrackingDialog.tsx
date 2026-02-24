import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Package, Calendar, MapPin, ChevronRight, X, Hash, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTrackingDialog({ isOpen, onClose }: OrderTrackingDialogProps) {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderId.trim().replace('#', '');
    
    if (cleanId.length < 36) {
      toast.error("Vui lòng nhập đầy đủ mã đơn hàng (36 ký tự).");
      return;
    }

    setIsLoading(true);
    setSearched(false);
    setOrders([]);

    try {
      const { data, error } = await supabase.functions.invoke('order-lookup', {
        body: { 
          action: 'track', 
          orderId: cleanId, 
          contact: contact.trim() 
        }
      });

      if (error) throw error;

      setOrders(data.orders || []);
      setSearched(true);
      toast.success(`Tìm thấy đơn hàng.`);
    } catch (error: any) {
      toast.error("Thông tin không chính xác hoặc đơn hàng không tồn tại.");
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
    setOrderId("");
    setContact("");
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
              Nhập đầy đủ mã đơn hàng từ email xác nhận để bảo mật thông tin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTrackOrder} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mã đơn hàng (Full ID)</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="orderId"
                    placeholder="Nhập đủ 36 ký tự..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="h-12 bg-white pl-10 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SĐT hoặc Email</Label>
                <Input
                  id="contact"
                  placeholder="0909xxxxxx"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-12 bg-white"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full btn-hero h-12 shadow-gold" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tra Cứu Ngay"}
            </Button>
          </form>
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-800 leading-relaxed">
              Vì lý do bảo mật, bạn cần nhập chính xác mã đơn hàng đầy đủ được gửi trong email hoặc tin nhắn xác nhận.
            </p>
          </div>
        </div>

        <ScrollArea className="max-h-[40vh] p-6 bg-white">
          {searched && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-xl overflow-hidden hover:shadow-subtle transition-shadow">
                  <div className="bg-secondary/10 p-4 flex items-center justify-between border-b border-border/50">
                    <div>
                      <p className="text-xs font-bold text-primary mb-1">#{order.id.slice(0, 8).toUpperCase()}...</p>
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
                    
                    <div className="pt-3 border-t border-dashed border-border/50 flex justify-between items-center">
                      <span className="text-sm font-bold">Tổng cộng:</span>
                      <span className="text-primary text-lg font-bold">{formatPrice(order.total_amount)}</span>
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