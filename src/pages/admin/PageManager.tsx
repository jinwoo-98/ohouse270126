import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Edit, 
  Search, 
  Loader2, 
  ExternalLink,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function PageManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_pages').select('*').order('category');
    setPages(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa trang...");
    try {
      const { error } = await supabase.from('site_pages').delete().eq('id', deleteId);
      if (error) throw error;
      setPages(pages.filter(p => p.id !== deleteId));
      toast.success("Đã xóa trang thành công.", { id: toastId });
    } catch (e: any) {
      toast.error("Lỗi xóa: " + e.message, { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = pages.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Trang Nội Dung</h1>
          <p className="text-muted-foreground text-sm">Chỉnh sửa nội dung các trang hỗ trợ, giới thiệu...</p>
        </div>
        <Button asChild className="btn-hero h-11">
          <Link to="/admin/pages/new"><Plus className="w-4 h-4 mr-2" /> Thêm trang mới</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên trang..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Tên trang</th>
                <th className="px-6 py-4">Đường dẫn (Slug)</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 border-b last:border-0">
                  <td className="px-6 py-4 font-bold text-sm">{page.title}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="capitalize">{page.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Xem trang">
                        <Link to={`/ho-tro/${page.slug}`} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="text-blue-600">
                        <Link to={`/admin/pages/edit/${page.id}`}><Edit className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(page.id)}>
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
        onConfirm={handleDelete}
        title="Xác nhận xóa trang"
        description="Toàn bộ nội dung của trang này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
        confirmText="Vẫn xóa trang"
      />
    </div>
  );
}