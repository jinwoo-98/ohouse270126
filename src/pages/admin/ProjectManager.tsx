import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Edit, Trash2, Loader2, Image as ImageIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ProjectManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Lỗi tải dự án: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Đã xóa dự án thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  const filtered = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Dự Án</h1>
          <p className="text-muted-foreground text-sm">Danh sách các công trình thiết kế và thi công tiêu biểu.</p>
        </div>
        <Button asChild className="btn-hero h-11">
          <Link to="/admin/projects/new"><Plus className="w-4 h-4 mr-2" /> Thêm dự án mới</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm dự án..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                <th className="px-6 py-4">Dự án</th>
                <th className="px-6 py-4">Hạng mục</th>
                <th className="px-6 py-4">Vị trí</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Chưa có dự án nào.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto text-gray-300 mt-3.5" />}
                      </div>
                      <span className="text-sm font-bold truncate max-w-xs">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="secondary" className="text-[10px] font-bold uppercase">{p.category}</Badge></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground"><MapPin className="w-3 h-3 inline mr-1" /> {p.location}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="text-blue-600"><Link to={`/admin/projects/edit/${p.id}`}><Edit className="w-4 h-4" /></Link></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
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