import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Info,
  Layers,
  Settings2,
  Image as ImageIcon,
  TrendingUp,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    original_price: "",
    description: "",
    category_id: "",
    image_url: "",
    material: "",
    style: "",
    is_featured: false,
    is_new: false,
    is_sale: false,
    display_order: "1000",
    fake_sold: "0",
    fake_review_count: "0",
    fake_rating: "5",
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .order('display_order', { ascending: true });
    setCategories(data || []);
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          price: data.price.toString(),
          original_price: data.original_price?.toString() || "",
          description: data.description || "",
          category_id: data.category_id || "",
          image_url: data.image_url || "",
          material: data.material || "",
          style: data.style || "",
          is_featured: data.is_featured,
          is_new: data.is_new,
          is_sale: data.is_sale,
          display_order: data.display_order?.toString() || "1000",
          fake_sold: data.fake_sold?.toString() || "0",
          fake_review_count: data.fake_review_count?.toString() || "0",
          fake_rating: data.fake_rating?.toString() || "5",
        });
      }
    } catch (error) {
      toast.error("Không tìm thấy sản phẩm");
      navigate("/admin/products");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Vui lòng tải lên ảnh đại diện sản phẩm");
      return;
    }
    if (!formData.category_id) {
      toast.error("Vui lòng chọn danh mục sản phẩm");
      return;
    }

    setLoading(true);
    const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const payload = {
      name: formData.name,
      slug: slug,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      description: formData.description,
      category_id: formData.category_id,
      image_url: formData.image_url,
      material: formData.material,
      style: formData.style,
      is_featured: formData.is_featured,
      is_new: formData.is_new,
      is_sale: formData.is_sale,
      display_order: parseInt(formData.display_order) || 1000,
      fake_sold: parseInt(formData.fake_sold) || 0,
      fake_review_count: parseInt(formData.fake_review_count) || 0,
      fake_rating: parseFloat(formData.fake_rating) || 5,
      updated_at: new Date()
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success("Thêm sản phẩm mới thành công!");
      }
      navigate("/admin/products");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tổ chức danh mục theo cấp cha-con để hiển thị đẹp hơn
  const parentCategories = categories.filter(c => !c.parent_id);

  if (fetching) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin/products"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
            <p className="text-muted-foreground">Điền thông tin chi tiết sản phẩm của bạn bên dưới.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="btn-hero shadow-gold px-10">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isEdit ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Info className="w-4 h-4" /> Thông tin cơ bản
            </h3>
            <div className="space-y-2">
              <Label>Tên sản phẩm *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ví dụ: Sofa da Ý cao cấp"
                required
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Chất liệu</Label>
                <Input value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} placeholder="Ví dụ: Gỗ Sồi, Da thật..." className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Phong cách</Label>
                <Input value={formData.style} onChange={(e) => setFormData({...formData, style: e.target.value})} placeholder="Ví dụ: Hiện đại, Minimalist..." className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập mô tả tóm tắt về sản phẩm..."
                rows={5}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Giá và Phân loại
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Giá bán lẻ (VND) *</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="h-12 font-bold text-primary" />
              </div>
              <div className="space-y-2">
                <Label>Giá gốc (Nếu có)</Label>
                <Input type="number" value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: e.target.value})} className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Danh mục sản phẩm *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(val) => setFormData({...formData, category_id: val})}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Chọn một danh mục" />
                </SelectTrigger>
                <SelectContent className="max-h-80 rounded-xl">
                  {parentCategories.map(parent => (
                    <SelectGroup key={parent.id}>
                      <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                      <SelectItem value={parent.slug}>-- {parent.name} (Tất cả)</SelectItem>
                      {categories.filter(c => c.parent_id === parent.id).map(child => (
                        <SelectItem key={child.id} value={child.slug}>
                          &nbsp;&nbsp;&nbsp;{child.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  {/* Trường hợp các danh mục đặc biệt không thuộc cha nào */}
                  {categories.filter(c => !c.parent_id && !categories.some(child => child.parent_id === c.id)).map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Cấu hình Marketing & Hiển thị
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Thứ tự hiển thị</Label>
                <Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Lượt mua ảo</Label>
                <Input type="number" value={formData.fake_sold} onChange={(e) => setFormData({...formData, fake_sold: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Điểm đánh giá</Label>
                <Input type="number" step="0.1" max="5" value={formData.fake_rating} onChange={(e) => setFormData({...formData, fake_rating: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Số lượng đánh giá</Label>
                <Input type="number" value={formData.fake_review_count} onChange={(e) => setFormData({...formData, fake_review_count: e.target.value})} className="h-12" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Hình ảnh chính
            </h3>
            <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url})} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" /> Thuộc tính hiển thị
            </h3>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex flex-col"><span className="text-xs font-bold uppercase">Sản phẩm Mới</span></div>
              <Switch checked={formData.is_new} onCheckedChange={(val) => setFormData({...formData, is_new: val})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex flex-col"><span className="text-xs font-bold uppercase">Đang Khuyến Mãi</span></div>
              <Switch checked={formData.is_sale} onCheckedChange={(val) => setFormData({...formData, is_sale: val})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex flex-col"><span className="text-xs font-bold uppercase">Sản phẩm Nổi Bật</span></div>
              <Switch checked={formData.is_featured} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}