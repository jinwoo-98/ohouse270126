import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "none",
    is_visible: true,
    is_highlight: false,
    menu_location: "main",
    display_order: "1000"
  });

  useEffect(() => {
    fetchParents();
    if (id) fetchCategory();
  }, [id]);

  const fetchParents = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .is('parent_id', null)
      .order('display_order', { ascending: true });
    setParents(data || []);
  };

  const fetchCategory = async () => {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id || "none",
        is_visible: data.is_visible,
        is_highlight: data.is_highlight,
        menu_location: data.menu_location || "main",
        display_order: data.display_order?.toString() || "1000"
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const slug = formData.slug || formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const payload = {
      name: formData.name,
      slug: slug,
      parent_id: formData.parent_id === "none" ? null : formData.parent_id,
      is_visible: formData.is_visible,
      is_highlight: formData.is_highlight,
      menu_location: formData.menu_location,
      display_order: parseInt(formData.display_order) || 1000
    };

    try {
      if (id) {
        await supabase.from('categories').update(payload).eq('id', id);
      } else {
        await supabase.from('categories').insert(payload);
      }
      toast.success("Đã lưu danh mục thành công!");
      navigate("/admin/categories");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild><Link to="/admin/categories"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{id ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-hero px-10 shadow-gold rounded-xl">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu danh mục
        </Button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vị trí menu trên Header</Label>
          <Select value={formData.menu_location} onValueChange={val => setFormData({...formData, menu_location: val})}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Chọn vị trí" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="main">Hàng 4 (Menu Sản Phẩm)</SelectItem>
              <SelectItem value="secondary">Hàng 3 (Menu Dịch Vụ & Hỗ Trợ)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tên danh mục / Menu</Label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ví dụ: Sofa Phòng Khách" required className="h-12 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Đường dẫn (Slug)</Label>
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="sofa-phong-khach" className="h-12 rounded-xl font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thứ tự hiển thị</Label>
              <Input type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Danh mục cha</Label>
            <Select value={formData.parent_id} onValueChange={val => setFormData({...formData, parent_id: val})}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">-- Không có (Danh mục gốc) --</SelectItem>
                {parents.filter(p => p.id !== id).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase">Hiển thị trên web</span>
              <span className="text-[9px] text-muted-foreground italic">Hiện hoặc Ẩn khỏi menu</span>
            </div>
            <Switch checked={formData.is_visible} onCheckedChange={val => setFormData({...formData, is_visible: val})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase">Nổi bật (Chữ đỏ)</span>
              <span className="text-[9px] text-muted-foreground italic">Ví dụ: mục SALE</span>
            </div>
            <Switch checked={formData.is_highlight} onCheckedChange={val => setFormData({...formData, is_highlight: val})} />
          </div>
        </div>
      </form>
    </div>
  );
}