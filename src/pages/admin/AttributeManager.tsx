import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Edit, Trash2, Loader2, List, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function AttributeManager() {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('attributes').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setAttributes(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa thuộc tính...");
    try {
      const { error } = await supabase.from('attributes').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success("Đã xóa thuộc tính thành công.", { id: toastId });
      setAttributes(attributes.filter(a => a.id !== deleteId));
    } catch (error: any) {
      toast.error("Lỗi: " + error.message, { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = attributes.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Thuộc Tính</h1>
          <p className="text-muted-foreground text-sm">Định nghĩa các thông số kỹ thuật cho sản phẩm (Màu sắc, Chất liệu...)</p>
        </div>
        <Button asChild className="btn-hero h-11"><Link to="/admin/attributes/new"><Plus className="w-4 h-4 mr-2" /> Tạo thuộc tính</Link></Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm tên thuộc tính..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                <th className="px-6 py-4">Tên thuộc tính</th>
                <th className="px-6 py-4">Loại nhập liệu</th>
                <th className="px-6 py-4">Các giá trị tùy chọn</th>
                <th className="px-6 py-4">Ghi chú</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Chưa có thuộc tính nào.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm text-charcoal">{item.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="gap-1">
                      {item.type === 'single' ? <List className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                      {item.type === 'single' ? 'Chọn 1 (Single)' : 'Chọn nhiều (Multi)'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {(Array.isArray(item.options) ? item.options : []).slice(0, 5).map((opt: string, i: number) => (
                        <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded border">{opt}</span>
                      ))}
                      {item.options?.length > 5 && <span className="text-[10px] text-muted-foreground">+{item.options.length - 5} nữa...</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{item.note || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="text-blue-600"><Link to={`/admin/attributes/edit/${item.id}`}><Edit className="w-4 h-4" /></Link></Button>
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
        title="Xác nhận xóa thuộc tính"
        description="Xóa thuộc tính này sẽ làm mất dữ liệu thuộc tính của các sản phẩm đang liên kết. Bạn có chắc chắn muốn thực hiện?"
        confirmText="Vẫn xóa"
      />
    </div>
  );
}