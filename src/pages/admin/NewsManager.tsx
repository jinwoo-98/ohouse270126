import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function NewsManager() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    setNews(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa bài viết...");
    try {
      await supabase.from('news').delete().eq('id', deleteId);
      setNews(news.filter(n => n.id !== deleteId));
      toast.success("Đã xóa tin tức thành công.", { id: toastId });
    } catch (e) {
      toast.error("Lỗi khi xóa bài viết.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Tin Tức</h1>
          <p className="text-muted-foreground text-sm">Đăng bài viết, xu hướng và cập nhật cho khách hàng.</p>
        </div>
        <Button asChild className="btn-hero h-11">
          <Link to="/admin/news/new"><Plus className="w-4 h-4 mr-2" /> Viết bài mới</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm bài viết..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Ngày đăng</th>
                <th className="px-6 py-4 text-center">Nổi bật</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Chưa có bài viết nào.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                        {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto text-gray-300 mt-3.5" />}
                      </div>
                      <span className="text-sm font-bold truncate max-w-xs">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="secondary" className="text-[10px] font-bold uppercase">{item.category}</Badge></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 text-center">{item.is_featured && <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="text-blue-600"><Link to={`/admin/news/edit/${item.id}`}><Edit className="w-4 h-4" /></Link></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
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
        onConfirm={handleDelete}
        title="Xác nhận xóa tin tức"
        description="Bạn có chắc chắn muốn xóa bài viết này không? Nội dung sẽ bị xóa vĩnh viễn khỏi website."
        confirmText="Vẫn xóa bài viết"
      />
    </div>
  );
}