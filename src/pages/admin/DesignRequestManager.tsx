import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Trash2, 
  Loader2, 
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DesignRequestManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('design_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('design_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      toast.success("Đã cập nhật trạng thái yêu cầu");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const filtered = requests.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Yêu Cầu Thiết Kế</h1>
          <p className="text-muted-foreground text-sm">Danh sách khách hàng cần tư vấn thiết kế nội thất.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên hoặc SĐT..." 
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Dịch vụ yêu cầu</th>
                <th className="px-6 py-4">Ngân sách</th>
                <th className="px-6 py-4">Lời nhắn</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Không có yêu cầu nào.</td></tr>
              ) : filtered.map((req) => (
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
                      {req.room_type || 'Tư vấn chung'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">
                    {req.budget ? `${req.budget} triệu` : 'Chưa rõ'}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-2" title={req.message}>
                      {req.message || 'Không có ghi chú.'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }>
                      {req.status === 'pending' ? 'Chờ xử lý' : 
                       req.status === 'contacted' ? 'Đã liên hệ' : 'Hoàn thành'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600"
                        onClick={() => updateStatus(req.id, 'contacted')}
                        title="Đánh dấu đã gọi"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-emerald-600"
                        onClick={() => updateStatus(req.id, 'completed')}
                        title="Hoàn thành"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}