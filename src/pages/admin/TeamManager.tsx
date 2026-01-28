import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  UserCog, 
  Search, 
  Loader2, 
  CheckCircle2,
  Mail,
  Phone,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PERMISSION_KEYS = [
  { key: 'homepage', label: 'Quản lý Trang chủ' },
  { key: 'orders', label: 'Quản lý Đơn hàng' },
  { key: 'products', label: 'Quản lý Sản phẩm' },
  { key: 'categories', label: 'Danh mục & Menu' },
  { key: 'marketing', label: 'Công cụ Marketing' },
  { key: 'reviews', label: 'Quản lý Đánh giá' },
  { key: 'pages', label: 'Quản lý Trang nội dung' },
  { key: 'news', label: 'Quản lý Tin tức' },
  { key: 'projects', label: 'Quản lý Dự án' },
  { key: 'design-requests', label: 'Yêu cầu Thiết kế' },
  { key: 'messages', label: 'Tin nhắn khách hàng' },
  { key: 'subscribers', label: 'Danh sách đăng ký' },
  { key: 'theme', label: 'Cấu hình Giao diện' },
  { key: 'settings', label: 'Cài đặt Hệ thống' },
];

export default function TeamManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isPermsOpen, setIsPermsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success("Đã cập nhật vai trò nhân sự");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleTogglePermission = async (key: string) => {
    if (!editingUser) return;
    
    const newPerms = { ...editingUser.permissions };
    newPerms[key] = !newPerms[key];
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ permissions: newPerms })
        .eq('id', editingUser.id);
      
      if (error) throw error;
      
      setEditingUser({ ...editingUser, permissions: newPerms });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, permissions: newPerms } : u));
    } catch (e: any) {
      toast.error("Lỗi cập nhật quyền hạn");
    }
  };

  const filtered = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <UserCog className="w-7 h-7 text-primary" />
            Quản Lý Nhân Sự & Phân Quyền
          </h1>
          <p className="text-muted-foreground text-sm">Chỉ định tài khoản dựa trên Email/SĐT và cấp quyền Dashboard.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo Email hoặc Số điện thoại..." 
              className="pl-10 h-11 bg-white rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Tài khoản (Email/SĐT)</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Quyền truy cập</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground italic">Không tìm thấy tài khoản phù hợp.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-charcoal truncate">{u.email || "Chưa cập nhật Email"}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-medium">
                          <Phone className="w-3 h-3" /> {u.phone || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Select value={u.role} onValueChange={(val) => handleUpdateRole(u.id, val)}>
                      <SelectTrigger className="w-36 h-9 text-xs font-bold rounded-xl bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="user">Khách hàng</SelectItem>
                        <SelectItem value="editor">Biên tập viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3">Toàn quyền hệ thống</Badge>
                    ) : u.role === 'editor' ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Object.entries(u.permissions || {}).filter(([_, v]) => v).length > 0 ? (
                          <Badge variant="outline" className="text-[9px] uppercase bg-primary/5 text-primary border-primary/20 font-bold">
                            {Object.entries(u.permissions || {}).filter(([_, v]) => v).length} Mục đã cấp
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Chưa được cấp quyền</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Mặc định (User)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role === 'editor' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => { setEditingUser(u); setIsPermsOpen(true); }}
                      >
                        <Settings className="w-3.5 h-3.5" /> Phân quyền
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isPermsOpen} onOpenChange={setIsPermsOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-elevated">
          <div className="bg-charcoal p-6 text-cream">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Cấp quyền Biên tập viên</DialogTitle>
                  <p className="text-[10px] text-taupe uppercase tracking-widest truncate max-w-[200px]">{editingUser?.email}</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <p className="text-xs text-muted-foreground mb-4 italic">Cho phép nhân viên này truy cập vào các tính năng:</p>
            <div className="grid gap-2">
              {PERMISSION_KEYS.map((p) => (
                <div 
                  key={p.key} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => handleTogglePermission(p.key)}
                >
                  <Label className="font-bold text-xs cursor-pointer text-charcoal">{p.label}</Label>
                  <Checkbox checked={editingUser?.permissions?.[p.key] || false} className="data-[state=checked]:bg-primary" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
            <Button className="btn-hero h-12 px-10 shadow-gold" onClick={() => setIsPermsOpen(false)}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> XÁC NHẬN CẤP QUYỀN
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}