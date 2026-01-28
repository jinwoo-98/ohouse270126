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
  Box,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";
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
    const slug = formData.slug || formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
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

  const parentCategories = categories.filter(c => !c.parent_id);

  if (fetching) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild>
            <Link to="/admin/products"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
            <p className="text-muted-foreground text-sm">Quản lý nội dung sản phẩm nhanh chóng và thuận tiện.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="btn-hero shadow-gold px-10 rounded-xl">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isEdit ? "Cập nhật ngay" : "Lưu sản phẩm"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. SECTION GIÁ VÀ PHÂN LOẠI (Ưu tiên lên trên cùng) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6 border-l-4 border-l-primary">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> 1. Giá bán và Phân loại
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá bán lẻ (VND) *</Label>
                <Input 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  required 
                  placeholder="Nhập giá bán..."
                  className="h-12 rounded-xl font-bold text-primary text-lg focus:ring-1" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá gốc (Gạch bỏ)</Label>
                <Input 
                  type="number" 
                  value={formData.original_price} 
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})} 
                  placeholder="Để trống nếu không có giá cũ..."
                  className="h-12 rounded-xl" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Danh mục sản phẩm *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(val) => setFormData({...formData, category_id: val})}
              >
                <SelectTrigger className="h-12 rounded-xl border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Bấm để chọn danh mục hiển thị..." />
                </SelectTrigger>
                <SelectContent className="max-h-80 rounded-xl">
                  {parentCategories.map(parent => (
                    <SelectGroup key={parent.id}>
                      <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                      <SelectItem value={parent.slug}>-- Tất cả {parent.name}</SelectItem>
                      {categories.filter(c => c.parent_id === parent.id).map(child => (
                        <SelectItem key={child.id} value={child.slug}>
                          &nbsp;&nbsp;&nbsp;{child.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. SECTION THÔNG TIN CHI TIẾT */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Info className="w-4 h-4" /> 2. Thông tin chi tiết
            </h3>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tên sản phẩm đầy đủ *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ví dụ: Sofa da Ý cao cấp 3 chỗ ngồi"
                required
                className="h-12 rounded-xl text-lg font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Chất liệu chính</Label>
                <Input value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} placeholder="Gỗ Óc Chó, Da thật..." className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phong cách thiết kế</Label>
                <Input value={formData.style} onChange={(e) => setFormData({...formData, style: e.target.value})} placeholder="Luxury, Minimalist..." className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả bài viết</Label>
                <AIContentAssistant 
                  contentType="product" 
                  contextTitle={formData.name} 
                  onInsert={(val) => setFormData({...formData, description: val})} 
                />
              </div>
              <RichTextEditor 
                value={formData.description} 
                onChange={(val) => setFormData({...formData, description: val})} 
                placeholder="Mô tả kỹ thuật, kích thước, ưu điểm của sản phẩm..."
              />
            </div>
          </div>
        </div>

        {/* CỘT PHỤ BÊN PHẢI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Hình ảnh chính
            </h3>
            <ImageUpload value={formData.image_url} onChange={(url) => setFormData({...formData, image_url: url})} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Marketing (Số liệu ảo)
            </h3>
            <div className="grid gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Thứ tự hiển thị (Càng nhỏ càng ưu tiên)</Label>
                <Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: e.target.value})} className="h-10 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Đã bán</Label>
                  <Input type="number" value={formData.fake_sold} onChange={(e) => setFormData({...formData, fake_sold: e.target.value})} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Điểm sao (Max 5)</Label>
                  <Input type="number" step="0.1" max="5" value={formData.fake_rating} onChange={(e) => setFormData({...formData, fake_rating: e.target.value})} className="h-10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" /> Trạng thái & Badge
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold uppercase">Sản phẩm Mới</span>
                <Switch checked={formData.is_new} onCheckedChange={(val) => setFormData({...formData, is_new: val})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold uppercase">Flash Sale</span>
                <Switch checked={formData.is_sale} onCheckedChange={(val) => setFormData({...formData, is_sale: val})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold uppercase">Nổi Bật (Hot)</span>
                <Switch checked={formData.is_featured} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}