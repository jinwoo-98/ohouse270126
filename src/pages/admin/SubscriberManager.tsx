import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2, Loader2, Copy, Mail, Calendar, UserCheck, BellRing, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubscriberManager() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [accountUsers, setAccountUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách đăng ký nhận tin (Subscribers)
      const { data: news, error: newsError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (newsError) throw newsError;

      // 2. Lấy danh sách tài khoản (Profiles) - Loại trừ staff
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .not('role', 'in', '("admin","editor")')
        .order('updated_at', { ascending: false });

      if (usersError) throw usersError;

      setNewsletters(news || []);
      setAccountUsers(users || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Xóa email này khỏi danh sách nhận tin?")) return;
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id);
      if (error) throw error;
      setNewsletters(newsletters.filter(s => s.id !== id));
      toast.success("Đã xóa thành công.");
    } catch (e: any) {
      toast.error("Không thể xóa: " + e.message);
    }
  };

  const handleCopyEmails = (data: any[]) => {
    const emails = data.map(s => s.email).filter(e => e).join(", ");
    if (!emails) {
      toast.info("Danh sách trống.");
      return;
    }
    navigator.clipboard.writeText(emails);
    toast.success("Đã sao chép danh sách email.");
  };

  const filteredNews = newsletters.filter(s => s.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = accountUsers.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Người Đăng Ký & Khách Hàng</h1>
          <p className="text-muted-foreground text-sm">Quản lý toàn bộ danh sách email nhận tin và tài khoản khách hàng.</p>
        </div>
      </div>

      <Tabs defaultValue="news" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
          <TabsList className="bg-secondary/50 p-1 h-11">
            <TabsTrigger value="news" className="px-6 h-9 font-bold text-xs uppercase gap-2">
              <BellRing className="w-4 h-4" /> Bản tin ({newsletters.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="px-6 h-9 font-bold text-xs uppercase gap-2">
              <UserCheck className="w-4 h-4" /> Tài khoản ({accountUsers.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo email, tên..." 
              className="pl-10 h-10 border-none bg-secondary/30 focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu khách hàng...</p>
          </div>
        ) : (
          <>
            <TabsContent value="news" className="animate-fade-in outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleCopyEmails(newsletters)} className="text-[10px] uppercase font-bold tracking-widest gap-2">
                    <Copy className="w-3.5 h-3.5" /> Sao chép tất cả Email
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                        <th className="px-6 py-4">Email đăng ký</th>
                        <th className="px-6 py-4">Ngày đăng ký</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredNews.length === 0 ? (
                        <tr><td colSpan={3} className="p-12 text-center text-muted-foreground italic">Không tìm thấy kết quả nào.</td></tr>
                      ) : filteredNews.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm text-charcoal">{item.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.created_at).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSub(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="animate-fade-in outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleCopyEmails(accountUsers)} className="text-[10px] uppercase font-bold tracking-widest gap-2">
                    <Copy className="w-3.5 h-3.5" /> Sao chép toàn bộ Email
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                        <th className="px-6 py-4">Khách hàng</th>
                        <th className="px-6 py-4">Thông tin liên hệ</th>
                        <th className="px-6 py-4">Ngày tham gia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={3} className="p-12 text-center text-muted-foreground italic">Chưa có khách hàng nào.</td></tr>
                      ) : filteredUsers.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-charcoal">{item.email || "Ẩn danh"}</span>
                                <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {item.id.slice(0,8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-charcoal">
                                {item.first_name || item.last_name ? `${item.first_name || ''} ${item.last_name || ''}` : "Chưa cập nhật tên"}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {item.phone || "---"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(item.updated_at || item.created_at).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}