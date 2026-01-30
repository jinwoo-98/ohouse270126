import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2, Loader2, Copy, Mail, Calendar, UserCheck, BellRing, User, Phone, LayoutGrid, MessageSquareText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

// --- Component con: Subscriber List ---
function SubscriberList({ searchTerm, filteredNews, newsletters, handleDeleteSub, handleCopyEmails, setDeleteId }: any) {
  return (
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
            ) : filteredNews.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border shadow-sm">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-charcoal">{item.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Component con: User Account List ---
function UserAccountList({ searchTerm, filteredUsers, handleCopyEmails }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b flex justify-end">
        <Button variant="outline" size="sm" onClick={() => handleCopyEmails(filteredUsers)} className="text-[10px] uppercase font-bold tracking-widest gap-2">
          <Copy className="w-3.5 h-3.5" /> Sao chép Email hiển thị
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
            ) : filteredUsers.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border shadow-sm">
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
                      <Phone className="w-3 h-3 text-primary" /> {item.phone || "---"}
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
  );
}

// --- Component con: Design Request List ---
function DesignRequestList({ searchTerm, loading, requests, fetchRequests }: any) {
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setIsUpdatingId(id);
    try {
      const { error } = await supabase
        .from('design_requests')
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

  const filtered = requests.filter((r: any) => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone?.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700">Chờ xử lý</Badge>;
      case 'contacted': return <Badge className="bg-blue-100 text-blue-700">Đã liên hệ</Badge>;
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-700">Hoàn thành</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Dịch vụ yêu cầu</th>
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
                    {req.room_type || 'Tư vấn chung'}
                  </Badge>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-xs text-muted-foreground line-clamp-2" title={req.message}>
                    {req.message || 'Không có ghi chú.'}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(req.status)}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Component con: Contact Message List ---
function ContactMessageList({ searchTerm, loading, messages, fetchMessages }: any) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa tin nhắn...");
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success("Đã xóa tin nhắn thành công.", { id: toastId });
      fetchMessages();
    } catch (error: any) {
      toast.error("Lỗi xóa: " + error.message, { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = messages.filter((m: any) => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Không có tin nhắn nào.</div>
        ) : (
          filtered.map((msg: any) => (
            <div key={msg.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all flex flex-col group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {msg.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">{msg.name}</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(msg.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(msg.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-3">
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Tiêu đề</p>
                  <p className="text-xs font-bold text-charcoal">{msg.subject || 'Không có tiêu đề'}</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{msg.message}"</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-primary" /> {msg.email}</span>
                <a href={`mailto:${msg.email}`} className="text-primary hover:underline cursor-pointer">Phản hồi qua Email</a>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa tin nhắn"
        description="Dữ liệu tin nhắn này sẽ bị xóa khỏi hệ thống quản trị. Bạn có chắc chắn không?"
        confirmText="Xác nhận xóa"
      />
    </div>
  );
}

// --- Main Component: CustomerHub ---
export default function CustomerHub() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [accountUsers, setAccountUsers] = useState<any[]>([]);
  const [designRequests, setDesignRequests] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'sub' | 'msg' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [newsRes, usersRes, designRes, contactRes] = await Promise.all([
        supabase.from('subscribers').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').not('role', 'in', '("admin","editor")').order('updated_at', { ascending: false }),
        supabase.from('design_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      ]);

      setNewsletters(newsRes.data || []);
      setAccountUsers(usersRes.data || []);
      setDesignRequests(designRes.data || []);
      setContactMessages(contactRes.data || []);
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
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

  const handleDeleteSub = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa email khỏi danh sách...");
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', deleteId);
      if (error) throw error;
      setNewsletters(newsletters.filter(s => s.id !== deleteId));
      toast.success("Đã xóa thành công.", { id: toastId });
    } catch (e: any) {
      toast.error("Không thể xóa: " + e.message, { id: toastId });
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
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
          <h1 className="text-2xl font-bold">Quản Lý Khách Hàng & Tương Tác</h1>
          <p className="text-muted-foreground text-sm">Quản lý tài khoản, danh sách đăng ký và các yêu cầu liên hệ.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
          <TabsList className="bg-secondary/50 p-1 h-11">
            <TabsTrigger value="users" className="px-6 h-9 font-bold text-xs uppercase gap-2">
              <UserCheck className="w-4 h-4" /> Tài khoản ({accountUsers.length})
            </TabsTrigger>
            <TabsTrigger value="news" className="px-6 h-9 font-bold text-xs uppercase gap-2">
              <BellRing className="w-4 h-4" /> Bản tin ({newsletters.length})
            </TabsTrigger>
            <TabsTrigger value="design" className="px-6 h-9 font-bold text-xs uppercase gap-2">
              <LayoutGrid className="w-4 h-4" /> Thiết kế ({designRequests.length})
            </TabsTrigger>
            <TabsTrigger value="contact" className="px-6 h-9 font-bold text-xs uppercase gap-2">
              <MessageSquareText className="w-4 h-4" /> Tin nhắn ({contactMessages.length})
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
            <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <TabsContent value="users" className="animate-fade-in outline-none">
              <UserAccountList searchTerm={searchTerm} filteredUsers={filteredUsers} handleCopyEmails={handleCopyEmails} />
            </TabsContent>

            <TabsContent value="news" className="animate-fade-in outline-none">
              <SubscriberList searchTerm={searchTerm} filteredNews={filteredNews} newsletters={newsletters} handleDeleteSub={handleDeleteSub} handleCopyEmails={handleCopyEmails} setDeleteId={(id: string) => { setDeleteId(id); setDeleteType('sub'); }} />
            </TabsContent>
            
            <TabsContent value="design" className="animate-fade-in outline-none">
              <DesignRequestList searchTerm={searchTerm} loading={false} requests={designRequests} fetchRequests={fetchData} />
            </TabsContent>

            <TabsContent value="contact" className="animate-fade-in outline-none">
              <ContactMessageList searchTerm={searchTerm} loading={false} messages={contactMessages} fetchMessages={fetchData} />
            </TabsContent>
          </>
        )}
      </Tabs>

      <ConfirmDialog 
        isOpen={deleteType === 'sub'}
        onClose={() => { setDeleteId(null); setDeleteType(null); }}
        onConfirm={handleDeleteSub}
        title="Xác nhận hủy đăng ký"
        description="Khách hàng này sẽ không còn nhận được các tin tức và ưu đãi mới nhất qua email. Bạn có chắc chắn muốn xóa?"
        confirmText="Xác nhận xóa"
      />
    </div>
  );
}