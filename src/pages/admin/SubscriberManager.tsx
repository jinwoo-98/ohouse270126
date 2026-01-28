import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2, Loader2, Copy, Mail, Calendar, UserCheck, BellRing } from "lucide-react";
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
      // Lấy danh sách đăng ký nhận tin
      const { data: news } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      // Lấy danh sách tài khoản khách hàng (loại trừ admin)
      const { data: users } = await supabase.from('profiles').select('*').eq('role', 'user').order('updated_at', { ascending: false });

      setNewsletters(news || []);
      setAccountUsers(users || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Xóa email này khỏi danh sách nhận tin?")) return;
    await supabase.from('subscribers').delete().eq('id', id);
    setNewsletters(newsletters.filter(s => s.id !== id));
    toast.success("Đã xóa.");
  };

  const handleCopyEmails = (data: any[]) => {
    const emails = data.map(s => s.email).filter(e => e).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("Đã sao chép danh sách email.");
  };

  const filteredNews = newsletters.filter(s => s.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = accountUsers.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Người Đăng Ký</h1>
          <p className="text-muted-foreground text-sm">Thống kê toàn bộ khách hàng và người nhận bản tin khuyến mãi.</p>
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
              placeholder="Tìm theo email..." 
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <TabsContent value="news">
              <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleCopyEmails(newsletters)} className="text-[10px] uppercase font-bold tracking-widest gap-2">
                    <Copy className="w-3.5 h-3.5" /> Sao chép tất cả email nhận tin
                  </Button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                      <th className="px-6 py-4">Email nhận bản tin</th>
                      <th className="px-6 py-4">Ngày đăng ký</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredNews.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-charcoal">{item.email}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSub(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleCopyEmails(accountUsers)} className="text-[10px] uppercase font-bold tracking-widest gap-2">
                    <Copy className="w-3.5 h-3.5" /> Sao chép email tài khoản
                  </Button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                      <th className="px-6 py-4">Tài khoản khách hàng</th>
                      <th className="px-6 py-4">Họ và Tên</th>
                      <th className="px-6 py-4">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">{item.email?.charAt(0).toUpperCase()}</div>
                            <span className="font-medium text-charcoal">{item.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{item.first_name} {item.last_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(item.updated_at).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}