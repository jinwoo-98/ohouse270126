import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Info, Home, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [allAttributes, setAllAttributes] = useState<any[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "none",
    is_visible: true,
    is_highlight: false,
    show_on_home: false,
    image_url: "",
    menu_location: "main",
    display_order: "1000",
    default_sort: "manual"
  });

  useEffect(() => {
    fetchParents();
    fetchAttributes();
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

  const fetchAttributes = async () => {
    const { data } = await supabase.from('attributes').select('*').order('name');
    setAllAttributes(data || []);
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
        show_on_home: data.show_on_home || false,
        image_url: data.image_url || "",
        menu_location: data.menu_location || "main",
        display_order: data.display_order?.toString() || "1000",
        default_sort: data.default_sort || "manual"
      });

      // Fetch existing attributes
      const { data: catAttrs } = await supabase
        .from('category_attributes')
        .select('attribute_id')
        .eq('category_id', id);
      
      if (catAttrs) {
        setSelectedAttrs(catAttrs.map(x => x.attribute_id));
      }
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
      show_on_home: formData.show_on_home,
      image_url: formData.image_url,
      menu_location: formData.menu_location,
      display_order: parseInt(formData.display_order) || 1000,
      default_sort: formData.default_sort
    };

    try {
      let categoryId = id;
      
      if (id) {
        await supabase.from('categories').update(payload).eq('id', id);
      } else {
        const { data } = await supabase.from('categories').insert(payload).select().single();
        categoryId = data.id;
      }

      // Update Attributes
      if (categoryId) {
        // Delete old
        await supabase.from('category_attributes').delete().eq('category_id', categoryId);
        
        // Insert new
        if (selectedAttrs.length > 0) {
          const attrPayload = selectedAttrs.map(attrId => ({
            category_id: categoryId,
            attribute_id: attrId
          }));
          await supabase.from('category_attributes').insert(attrPayload);
        }
      }

      toast.success("Đã lưu danh mục thành công!");
      navigate("/admin/categories");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttribute = (attrId: string) => {
    if (selectedAttrs.includes(attrId)) {
      setSelectedAttrs(selectedAttrs.filter(id => id !== attrId));
    } else {
      setSelectedAttrs([...selectedAttrs, attrId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            {/* Existing Fields ... */}
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sắp xếp mặc định</Label>
                  <Select value={formData.default_sort} onValueChange={val => setFormData({...formData, default_sort: val})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Chọn kiểu sắp xếp" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="manual">Thứ tự ưu tiên (Thủ công)</SelectItem>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="popular">Bán chạy nhất</SelectItem>
                      <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase">Hiện ở Trang Chủ</span>
                    <span className="text-[9px] text-muted-foreground italic">Danh mục sẽ xuất hiện trong lưới danh mục ở trang chủ.</span>
                  </div>
                </div>
                <Switch checked={formData.show_on_home} onCheckedChange={val => setFormData({...formData, show_on_home: val})} />
              </div>
            </div>
          </form>

          {/* ATTRIBUTE CONFIGURATION */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="p-2 bg-secondary rounded-lg text-charcoal"><ListFilter className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Cấu hình Thuộc tính</h3>
                <p className="text-[10px] text-muted-foreground font-medium italic">Sản phẩm thuộc danh mục này sẽ có các thuộc tính nào?</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {allAttributes.map(attr => (
                <div 
                  key={attr.id} 
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAttrs.includes(attr.id) ? "bg-primary/5 border-primary/40" : "bg-white border-border hover:bg-secondary/30"
                  }`}
                  onClick={() => toggleAttribute(attr.id)}
                >
                  <Checkbox checked={selectedAttrs.includes(attr.id)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-charcoal">{attr.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {attr.type === 'single' ? 'Chọn 1' : 'Chọn nhiều'} • {attr.options?.length || 0} tùy chọn
                    </p>
                  </div>
                </div>
              ))}
              {allAttributes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground text-sm italic">
                  Chưa có thuộc tính nào. <Link to="/admin/attributes/new" className="text-primary hover:underline">Tạo ngay</Link>
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100">
              <Info className="w-3 h-3 inline mr-1" />
              Lưu ý: Nếu danh mục này là danh mục con, nó cũng sẽ tự động kế thừa các thuộc tính của danh mục cha khi đăng sản phẩm.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ảnh đại diện danh mục</Label>
            <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url as string})} />
            <p className="text-[10px] text-muted-foreground italic">Cần thiết nếu bạn chọn hiển thị danh mục này ở trang chủ.</p>
          </div>
        </div>
      </div>
    </div>
  );
}