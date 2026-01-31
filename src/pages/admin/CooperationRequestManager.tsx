import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, Phone, Mail, Handshake, CheckCircle2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function CooperationRequestManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cooperation_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Lỗi tải yêu cầu hợp tác.");
    } finally {
      setLoading(false);
    }
  };
  
  const updateStatus = async (id: string, status: string) => {
    setIsUpdatingId(id);
    try {
      const { error } = await supabase
        .from('cooperation_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success("Đã cập nhật trạng thái yêu cầu");
      fetchRequests();
    } catch (error: any) {
      toast.error("Lỗi cập nhật: " + error.message);
    } finally {
      setIsUpdatingId(null);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa yêu cầu...");
    try {
      const { error } = await supabase.from('cooperation_requests').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success("Đã xóa yêu cầu thành công.", { id: toastId });
      fetchRequests();
    } catch (e) {
      toast.error("Lỗi xóa yêu cầu.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700">Chờ xử lý</Badge>;
      case 'contacted': return <Badge className="bg-blue-100 text-blue-700">Đã liên hệ</Badge>;
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-700">Hoàn thành</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filtered = requests.filter((r: any) => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone?.includes(searchTerm) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Handshake className="w-7 h-7 text-primary" />
            Quản Lý Yêu Cầu Hợp Tác
          </h1>
          <p className="text-muted-foreground text-sm">Danh sách các yêu cầu hợp tác kinh doanh, đại lý, nhà thầu, KTS.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Tìm theo tên, SĐT, Email..." 
          className="pl-10 h-11 bg-white rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Loại hình</th>
                <th className="px-6 py-4">Lời nhắn</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Không có yêu cầu nào.</td></tr>
              ) : filtered.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-charcoal">{req.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                        <Phone className="w-3 h-3" /> {req.phone}
                      </div>
                      {req.email && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                          <Mail className="w-3 h-3" /> {req.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none capitalize">
                      {req.type || 'Hợp tác chung'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-2" title={req.message}>
                      {req.message || 'Không có ghi chú.'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isUpdatingId === req.id ? (
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-primary animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> ĐANG LƯU...
                        </div>
                      ) : (
                        getStatusBadge(req.status)
                      )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600"
                        onClick={() => updateStatus(req.id, 'contacted')}
                        title="Đánh dấu đã gọi"
                        disabled={isUpdatingId === req.id || req.status === 'completed'}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-emerald-600"
                        onClick={() => updateStatus(req.id, 'completed')}
                        title="Hoàn thành"
                        disabled={isUpdatingId === req.id || req.status === 'completed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => setDeleteId(req.id)}
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa yêu cầu hợp tác"
        description="Hành động này sẽ xóa vĩnh viễn yêu cầu hợp tác khỏi hệ thống."
        confirmText="Xác nhận xóa"
      />
    </div>
  );
}