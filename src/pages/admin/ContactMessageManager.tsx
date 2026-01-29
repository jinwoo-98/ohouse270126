import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Trash2, 
  Loader2, 
  Mail, 
  Calendar,
  MessageSquare,
  MoreVertical,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function ContactMessageManager() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa tin nhắn...");
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', deleteId);
      if (error) throw error;
      setMessages(messages.filter(m => m.id !== deleteId));
      toast.success("Đã xóa tin nhắn thành công.", { id: toastId });
    } catch (error: any) {
      toast.error("Lỗi xóa: " + error.message, { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = messages.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tin Nhắn Khách Hàng</h1>
        <p className="text-muted-foreground text-sm">Phản hồi và ý kiến khách hàng gửi qua website.</p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo tên, email hoặc tiêu đề..." 
            className="border-none shadow-none focus-visible:ring-0 p-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Không có tin nhắn nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((msg) => (
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
                  <span className="text-primary hover:underline cursor-pointer">Phản hồi qua Email</span>
                </div>
              </div>
            ))}
          </div>
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