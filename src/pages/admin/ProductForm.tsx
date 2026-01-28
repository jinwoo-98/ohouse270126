import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Info,
  Layers,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    original_price: "",
    description: "",
    category_id: "",
    image_url: "",
    is_featured: false,
    is_new: false,
    is_sale: false,
  });

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, [id]);

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
          is_featured: data.is_featured,
          is_new: data.is_new,
          is_sale: data.is_sale,
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

    setLoading(true);
    const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const payload = {
      ...formData,
      slug,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
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
        {/* Main content */}
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
            <div className="space-y-2">
              <Label>Slug (Đường dẫn thân thiện)</Label>
              <Input 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="sofa-da-y-cao-cap"
                className="h-12 font-mono text-xs"
              />
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
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0"
                  required
                  className="h-12 font-bold text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Giá gốc (Nếu có - để hiện gạch ngang)</Label>
                <Input 
                  type="number"
                  value={formData.original_price} 
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  placeholder="0"
                  className="h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Danh mục (Slug)</Label>
              <Input 
                value={formData.category_id} 
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                placeholder="sofa, ban-an, ke-tivi..."
                className="h-12"
              />
            </div>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Hình ảnh chính
            </h3>
            <ImageUpload 
              value={formData.image_url} 
              onChange={(url) => setFormData({...formData, image_url: url})} 
            />
            <p className="text-[10px] text-muted-foreground italic text-center">Ảnh này sẽ hiển thị ở danh sách sản phẩm bên ngoài web.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" /> Thuộc tính hiển thị
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase">Sản phẩm Mới</span>
                <span className="text-[10px] text-muted-foreground">Hiện nhãn "NEW"</span>
              </div>
              <Switch 
                checked={formData.is_new} 
                onCheckedChange={(val) => setFormData({...formData, is_new: val})} 
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase">Đang Khuyến Mãi</span>
                <span className="text-[10px] text-muted-foreground">Hiện nhãn "SALE"</span>
              </div>
              <Switch 
                checked={formData.is_sale} 
                onCheckedChange={(val) => setFormData({...formData, is_sale: val})} 
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase">Sản phẩm Nổi Bật</span>
                <span className="text-[10px] text-muted-foreground">Ưu tiên hiện trang chủ</span>
              </div>
              <Switch 
                checked={formData.is_featured} 
                onCheckedChange={(val) => setFormData({...formData, is_featured: val})} 
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}