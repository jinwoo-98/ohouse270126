import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Info, FileText, Ruler, ImageIcon, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { ProductVariantsSection } from "@/components/admin/product-form/ProductVariantsSection";
import { CrossSellSection } from "@/components/admin/product-form/CrossSellSection";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allAttributes, setAllAttributes] = useState<any[]>([]);
  
  const [tierConfig, setTierConfig] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    original_price: "",
    description: "",
    short_description: "",
    category_id: "",
    image_url: "",
    gallery_urls: [] as string[],
    dimension_image_url: "",
    is_featured: false,
    is_new: false,
    is_sale: false,
    display_order: "1000",
    fake_sold: "0",
    fake_review_count: "0",
    fake_rating: "5",
    perfect_match_ids: [] as string[],
    bought_together_ids: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
    fetchSystemAttributes();
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
  };

  const fetchSystemAttributes = async () => {
    const { data } = await supabase.from('attributes').select('*').order('name');
    setAllAttributes(data || []);
  };

  const fetchAllProducts = async () => {
    // Fetch nhiều hơn để dùng cho select box
    const { data } = await supabase.from('products').select('id, name').neq('id', id || 'new').limit(1000);
    setAllProducts(data || []);
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          price: data.price.toString(),
          original_price: data.original_price?.toString() || "",
          display_order: data.display_order?.toString() || "1000",
          fake_sold: data.fake_sold?.toString() || "0",
          fake_review_count: data.fake_review_count?.toString() || "0",
          fake_rating: data.fake_rating?.toString() || "5",
          perfect_match_ids: data.perfect_match_ids || [],
          bought_together_ids: data.bought_together_ids || [],
          dimension_image_url: data.dimension_image_url || "",
          short_description: data.short_description || ""
        });

        if (data.tier_variants_config) setTierConfig(data.tier_variants_config);
        const { data: vData } = await supabase.from('product_variants').select('*').eq('product_id', id);
        if (vData) setVariants(vData);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast.error("Vui lòng điền Tên sản phẩm và chọn Danh mục.");
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      display_order: parseInt(formData.display_order),
      fake_sold: parseInt(formData.fake_sold),
      fake_review_count: parseInt(formData.fake_review_count),
      fake_rating: parseFloat(formData.fake_rating),
      tier_variants_config: tierConfig,
      updated_at: new Date()
    };

    try {
      let productId = id;
      if (isEdit) {
        await supabase.from('products').update(payload).eq('id', id);
      } else {
        const { data } = await supabase.from('products').insert(payload).select().single();
        productId = data.id;
      }

      await supabase.from('product_variants').delete().eq('product_id', productId);
      if (variants.length > 0) {
        const variantPayloads = variants.map(v => ({
          product_id: productId,
          tier_values: v.tier_values,
          price: parseFloat(v.price),
          original_price: v.original_price ? parseFloat(v.original_price) : null,
          stock: parseInt(v.stock),
          sku: v.sku
        }));
        await supabase.from('product_variants').insert(variantPayloads);
      }

      toast.success("Đã lưu sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild><Link to="/admin/products"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="btn-hero px-10 rounded-xl shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu toàn bộ
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6 border-l-4 border-l-primary">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Info className="w-4 h-4" /> 1. Thông tin cơ bản
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tên sản phẩm *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ví dụ: Sofa da Ý cao cấp" className="h-12 rounded-xl text-lg font-bold" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả sản phẩm (Hiển thị bên phải trang chi tiết)</Label>
                <Textarea 
                  value={formData.short_description} 
                  onChange={e => setFormData({...formData, short_description: e.target.value})} 
                  placeholder="Nhập đoạn mô tả ngắn về đặc điểm sản phẩm..."
                  className="rounded-xl resize-none"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Danh mục hiển thị *</Label>
                <Select value={formData.category_id} onValueChange={val => setFormData({...formData, category_id: val})}>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-none"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
                  <SelectContent className="max-h-80 rounded-xl">
                    {categories.filter(c => !c.parent_id).map(p => (
                      <SelectGroup key={p.id}>
                        <SelectLabel className="font-bold text-primary">{p.name}</SelectLabel>
                        <SelectItem value={p.slug}>-- Tất cả {p.name}</SelectItem>
                        {categories.filter(c => c.parent_id === p.id).map(child => <SelectItem key={child.id} value={child.slug}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>)}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ProductVariantsSection attributes={allAttributes} tierConfig={tierConfig} setTierConfig={setTierConfig} variants={variants} setVariants={setVariants} basePrice={formData.price} />

          <div className="bg-white p-8 rounded-3xl border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> 3. Bài viết khám phá sản phẩm
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nội dung chi tiết (Có ảnh)</Label>
                <AIContentAssistant contentType="product" contextTitle={formData.name} onInsert={val => setFormData({...formData, description: val})} />
              </div>
              <RichTextEditor value={formData.description} onChange={val => setFormData({...formData, description: val})} />
            </div>
          </div>

          <CrossSellSection formData={formData} setFormData={setFormData} allProducts={allProducts} />
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
             <Label className="text-xs font-bold uppercase text-primary">Ảnh đại diện chính</Label>
             <ImageUpload value={formData.image_url} onChange={url => setFormData({...formData, image_url: url as string})} />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Ruler className="w-4 h-4" /> Ảnh kích thước</h3>
            <ImageUpload value={formData.dimension_image_url} onChange={url => setFormData({...formData, dimension_image_url: url as string})} />
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Bộ sưu tập ảnh</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {formData.gallery_urls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData({...formData, gallery_urls: formData.gallery_urls.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <ImageUpload multiple onChange={urls => setFormData({...formData, gallery_urls: [...formData.gallery_urls, ...(Array.isArray(urls) ? urls : [urls])]})} />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Layers className="w-4 h-4" /> Marketing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold uppercase">Hàng Mới</span>
                <Switch checked={formData.is_new} onCheckedChange={val => setFormData({...formData, is_new: val})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold uppercase">Flash Sale</span>
                <Switch checked={formData.is_sale} onCheckedChange={val => setFormData({...formData, is_sale: val})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold uppercase">Nổi Bật</span>
                <Switch checked={formData.is_featured} onCheckedChange={val => setFormData({...formData, is_featured: val})} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}