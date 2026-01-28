import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Layers,
  ArrowDownRight,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true }); // Sắp xếp theo tên

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_visible: !current })
        .eq('id', id);
      
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, is_visible: !current } : c));
      toast.success("Đã cập nhật trạng thái hiển thị");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này? Tất cả danh mục con cũng sẽ bị ảnh hưởng.")) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Đã xóa thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  const renderTable = (location: string) => {
    const parents = categories.filter(c => c.menu_location === location && !c.parent_id);
    const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Tên danh mục / Menu</th>
                <th className="px-6 py-4">Đường dẫn (Slug)</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : parents.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground italic">Chưa có dữ liệu ở vị trí này.</td></tr>
              ) : parents.map((parent) => (
                <CategoryRow 
                  key={parent.id} 
                  category={parent} 
                  children={getChildren(parent.id)}
                  onToggle={toggleVisibility}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cấu Hình Menu & Danh Mục</h1>
          <p className="text-muted-foreground text-sm">Quản lý phân cấp danh mục hiển thị trên toàn hệ thống.</p>
        </div>
        <Button asChild className="btn-hero shadow-gold">
          <Link to="/admin/categories/new">
            <Plus className="w-4 h-4 mr-2" /> Thêm menu mới
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="main" className="space-y-6">
        <TabsList className="bg-white border p-1 h-12 rounded-xl">
          <TabsTrigger value="main" className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest">
            Hàng 4 (Danh mục Sản phẩm)
          </TabsTrigger>
          <TabsTrigger value="secondary" className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest">
            Hàng 3 (Dịch vụ & Hỗ trợ)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="mt-0">
          {renderTable('main')}
        </TabsContent>

        <TabsContent value="secondary" className="mt-0">
          {renderTable('secondary')}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryRow({ category, children, onToggle, onDelete }: any) {
  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-charcoal">{category.name}</span>
            {category.is_highlight && <Badge className="bg-red-500 text-[8px] h-4 px-1 uppercase">Nổi bật</Badge>}
          </div>
        </td>
        <td className="px-6 py-4">
          <code className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">/{category.slug}</code>
        </td>
        <td className="px-6 py-4 text-center">
          <button 
            onClick={() => onToggle(category.id, category.is_visible)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
              category.is_visible ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}
          >
            {category.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {category.is_visible ? "Hiện" : "Ẩn"}
          </button>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-50 text-blue-600" asChild>
              <Link to={`/admin/categories/edit/${category.id}`}><Edit className="w-4 h-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => onDelete(category.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
      
      {children.map((child: any) => (
        <tr key={child.id} className="bg-gray-50/30 hover:bg-gray-100 transition-colors">
          <td className="px-6 py-3">
            <div className="flex items-center gap-2 pl-10">
              <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              <span className="text-xs font-medium text-charcoal">{child.name}</span>
            </div>
          </td>
          <td className="px-6 py-3">
            <code className="text-[10px] text-muted-foreground/60">/{child.slug}</code>
          </td>
          <td className="px-6 py-3 text-center">
            <button 
              onClick={() => onToggle(child.id, child.is_visible)}
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border transition-all ${
                child.is_visible ? 'text-emerald-500 border-emerald-100 bg-white' : 'text-muted-foreground border-transparent bg-gray-100'
              }`}
            >
              {child.is_visible ? "Hiển thị" : "Đang ẩn"}
            </button>
          </td>
          <td className="px-6 py-3 text-right">
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-blue-50 text-blue-600" asChild>
                <Link to={`/admin/categories/edit/${child.id}`}><Edit className="w-3.5 h-3.5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-destructive/5 text-destructive" onClick={() => onDelete(child.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}