import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Info, FileText, ImageIcon, Layers, Box, Settings2, Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";

// Import các section đã tách nhỏ
import { PricingCategorySection } from "@/components/admin/product-form/PricingCategorySection";
import { ProductVariantsSection } from "@/components/admin/product-form/ProductVariantsSection";
import { ProductDetailSection } from "@/components/admin/product-form/ProductDetailSection";
import { ProductMediaSection } from "@/components/admin/product-form/ProductMediaSection";
import { ProductStatusSection } from "@/components/admin/product-form/ProductStatusSection";
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
  const [productAttrs, setProductAttrs] = useState<Record<string, string[]>>({});
  
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
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setFetching(true);
    const [cats, prods, attrs] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('products').select('id, name, image_url').neq('id', id || 'new').limit(1000),
      supabase.from('attributes').select('*').order('name')
    ]);
    
    setCategories(cats.data || []);
    setAllProducts(prods.data || []);
    setAllAttributes(attrs.data || []);
    
    if (isEdit) await fetchProduct();
    setFetching(false);
  };

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
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

      if (data.tier_variants_config) setTierConfig(data.tier_variants_config);
      
      const [vRes, aRes] = await Promise.all([
        supabase.from('product_variants').select('*').eq('product_id', id),
        supabase.from('product_attributes').select('attribute_id, value').eq('product_id', id)
      ]);
      
      if (vRes.data) setVariants(vRes.data);
      if (aRes.data) {
        const attrMap: Record<string, string[]> = {};
        aRes.data.forEach(item => {
          attrMap[item.attribute_id] = Array.isArray(item.value) ? item.value : [item.value];
        });
        setProductAttrs(attrMap);
      }
    }
  };

  const handleAttributeChange = (attrId: string, value: any, isMulti: boolean) => {
    setProductAttrs(prev => {
      const current = prev[attrId] || [];
      if (isMulti) {
        return { ...prev, [attrId]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
      }
      return { ...prev, [attrId]: [value] };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      toast.error("Vui lòng nhập đầy đủ Tên, Giá và Danh mục.");
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

      // Sync Variants
      await supabase.from('product_variants').delete().eq('product_id', productId);
      if (variants.length > 0) {
        await supabase.from('product_variants').insert(variants.map(v => ({
          product_id: productId,
          tier_values: v.tier_values,
          price: parseFloat(v.price),
          original_price: v.original_price ? parseFloat(v.original_price) : null,
          stock: parseInt(v.stock),
          sku: v.sku
        })));
      }

      // Sync Attributes
      await supabase.from('product_attributes').delete().eq('product_id', productId);
      const attrPayloads = Object.entries(productAttrs).map(([attrId, values]) => ({
        product_id: productId,
        attribute_id: attrId,
        value: values
      }));
      if (attrPayloads.length > 0) await supabase.from('product_attributes').insert(attrPayloads);

      toast.success("Đã lưu sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild><Link to="/admin/products"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="btn-hero px-10 rounded-xl shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu toàn bộ
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar shadow-sm">
          <TabsTrigger value="general" className="rounded-xl h-12 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest gap-2">
            <Info className="w-4 h-4" /> Thông tin & Giá
          </TabsTrigger>
          <TabsTrigger value="variants" className="rounded-xl h-12 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest gap-2">
            <Layers className="w-4 h-4" /> Phân loại (Biến thể)
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-xl h-12 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest gap-2">
            <ImageIcon className="w-4 h-4" /> Hình ảnh & Mô tả
          </TabsTrigger>
          <TabsTrigger value="cross-sell" className="rounded-xl h-12 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest gap-2">
            <Box className="w-4 h-4" /> Gợi ý phối đồ
          </TabsTrigger>
        </TabsList>

        <div className="mt-8 animate-fade-in">
          <TabsContent value="general" className="space-y-8 outline-none">
            <PricingCategorySection formData={formData} setFormData={setFormData} categories={categories} />
            <ProductStatusSection formData={formData} setFormData={setFormData} />
            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Settings2 className="w-4 h-4" /> Chỉ số ảo (Marketing)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Lượt bán ảo</Label>
                  <Input type="number" value={formData.fake_sold} onChange={e=>setFormData({...formData, fake_sold: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Lượt đánh giá ảo</Label>
                  <Input type="number" value={formData.fake_review_count} onChange={e=>setFormData({...formData, fake_review_count: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Điểm đánh giá ảo</Label>
                  <Input type="number" step="0.1" value={formData.fake_rating} onChange={e=>setFormData({...formData, fake_rating: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Thứ tự hiển thị</Label>
                  <Input type="number" value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="outline-none">
            <ProductVariantsSection attributes={allAttributes} tierConfig={tierConfig} setTierConfig={setTierConfig} variants={variants} setVariants={setVariants} basePrice={formData.price} />
          </TabsContent>

          <TabsContent value="media" className="space-y-8 outline-none">
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                  <ProductDetailSection formData={formData} setFormData={setFormData} availableAttributes={allAttributes} productAttrs={productAttrs} handleAttributeChange={handleAttributeChange} />
               </div>
               <div className="lg:col-span-1">
                  <ProductMediaSection formData={formData} setFormData={setFormData} />
               </div>
            </div>
          </TabsContent>

          <TabsContent value="cross-sell" className="outline-none">
            <CrossSellSection formData={formData} setFormData={setFormData} allProducts={allProducts} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}