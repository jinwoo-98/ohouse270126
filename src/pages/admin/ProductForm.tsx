import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Info, Box, Settings2, ImageIcon, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);
  const [productAttrs, setProductAttrs] = useState<Record<string, any>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    original_price: "",
    description: "",
    category_id: "",
    image_url: "",
    gallery_urls: [] as string[],
    material: "",
    style: "",
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
    if (isEdit) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (formData.category_id) {
      fetchAttributesForCategory(formData.category_id);
    }
  }, [formData.category_id, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
  };

  const fetchAllProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').neq('id', id || 'new').limit(200);
    setAllProducts(data || []);
  };

  const fetchAttributesForCategory = async (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    if (!category) return;

    const { data: links } = await supabase
      .from('category_attributes')
      .select('attribute_id')
      .eq('category_id', category.id);
    
    if (links && links.length > 0) {
      const attrIds = links.map(l => l.attribute_id);
      const { data: attrs } = await supabase.from('attributes').select('*').in('id', attrIds);
      setAvailableAttributes(attrs || []);
    } else {
      setAvailableAttributes([]);
    }
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
          bought_together_ids: data.bought_together_ids || []
        });

        // Load attributes
        const { data: pAttrs } = await supabase.from('product_attributes').select('*').eq('product_id', id);
        if (pAttrs) {
          const loadedAttrs: Record<string, any> = {};
          pAttrs.forEach(item => { loadedAttrs[item.attribute_id] = item.value; });
          setProductAttrs(loadedAttrs);
        }
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      display_order: parseInt(formData.display_order),
      fake_sold: parseInt(formData.fake_sold),
      fake_review_count: parseInt(formData.fake_review_count),
      fake_rating: parseFloat(formData.fake_rating),
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

      // Sync attributes
      await supabase.from('product_attributes').delete().eq('product_id', productId);
      const attrPayloads = Object.entries(productAttrs).map(([attrId, val]) => ({
        product_id: productId,
        attribute_id: attrId,
        value: val
      }));
      if (attrPayloads.length > 0) await supabase.from('product_attributes').insert(attrPayloads);

      toast.success("Đã lưu sản phẩm!");
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(error.message);
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
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu sản phẩm
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* PRICING & CATEGORY */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Settings2 className="w-4 h-4" /> 1. Giá & Phân loại</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Giá bán (VND)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="h-12 rounded-xl" /></div>
              <div className="space-y-2"><Label>Giá gốc</Label><Input type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} className="h-12 rounded-xl" /></div>
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={formData.category_id} onValueChange={val => setFormData({...formData, category_id: val})}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
                <SelectContent>
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

          {/* CROSS-SELLS */}
          <div className="bg-white p-8 rounded-3xl border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Box className="w-4 h-4" /> 2. Cross-sell (Perfect Match)</h3>
            <div className="space-y-2">
              <Label>Sản phẩm gợi ý phối cảnh</Label>
              <Select onValueChange={val => !formData.perfect_match_ids.includes(val) && setFormData({...formData, perfect_match_ids: [...formData.perfect_match_ids, val]})}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Thêm sản phẩm để phối..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {allProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.perfect_match_ids.map(pid => {
                  const p = allProducts.find(x => x.id === pid);
                  return p ? <Badge key={pid} variant="secondary" className="gap-2 pl-3">{p.name}<button type="button" onClick={() => setFormData({...formData, perfect_match_ids: formData.perfect_match_ids.filter(x => x !== pid)})}><X className="w-3 h-3" /></button></Badge> : null;
                })}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="bg-white p-8 rounded-3xl border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Info className="w-4 h-4" /> 3. Thông tin chi tiết</h3>
            <div className="space-y-2"><Label>Tên sản phẩm *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl text-lg font-bold" required /></div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between"><Label>Mô tả bài viết</Label><AIContentAssistant contentType="product" contextTitle={formData.name} onInsert={val => setFormData({...formData, description: val})} /></div>
              <RichTextEditor value={formData.description} onChange={val => setFormData({...formData, description: val})} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border space-y-4">
             <Label className="text-xs font-bold uppercase text-primary">Ảnh đại diện</Label>
             <ImageUpload value={formData.image_url} onChange={url => setFormData({...formData, image_url: url as string})} />
          </div>
          <div className="bg-white p-6 rounded-3xl border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Layers className="w-4 h-4" /> Trạng thái</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl"><span>Sản phẩm Mới</span><Switch checked={formData.is_new} onCheckedChange={val => setFormData({...formData, is_new: val})} /></div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl"><span>Flash Sale</span><Switch checked={formData.is_sale} onCheckedChange={val => setFormData({...formData, is_sale: val})} /></div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl"><span>Nổi Bật</span><Switch checked={formData.is_featured} onCheckedChange={val => setFormData({...formData, is_featured: val})} /></div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}