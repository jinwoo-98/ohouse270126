import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

// Import các section đã tối ưu
import { ProductDetailSection } from "@/components/admin/product-form/ProductDetailSection";
import { PricingCategorySection } from "@/components/admin/product-form/PricingCategorySection";
import { ProductStatusSection } from "@/components/admin/product-form/ProductStatusSection";
import { ProductMediaSection } from "@/components/admin/product-form/ProductMediaSection";
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
    image_alt_text: "",
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

  useEffect(() => {
    if (formData.name && !isEdit) {
      setFormData(prev => ({ ...prev, slug: slugify(formData.name) }));
    }
  }, [formData.name, isEdit]);

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
        bought_together_ids: data.bought_together_ids || [],
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
    if (!formData.name || !formData.category_id) {
      toast.error("Vui lòng nhập Tên và chọn Danh mục.");
      return;
    }

    setLoading(true);
    
    let finalPrice = parseFloat(formData.price) || 0;
    let finalOriginalPrice = formData.original_price ? parseFloat(formData.original_price) : null;

    if (tierConfig.length > 0 && variants.length > 0) {
      finalPrice = parseFloat(variants[0].price) || 0;
      finalOriginalPrice = variants[0].original_price ? parseFloat(variants[0].original_price) : null;
    }

    const payload = {
      ...formData,
      price: finalPrice,
      original_price: finalOriginalPrice,
      display_order: parseInt(formData.display_order),
      fake_sold: parseInt(formData.fake_sold),
      fake_review_count: parseInt(formData.fake_review_count),
      fake_rating: parseFloat(formData.fake_rating),
      tier_variants_config: tierConfig,
      updated_at: new Date()
    };

    try {
      let productId = id;
      const { data: pResult, error: pError } = isEdit 
        ? await supabase.from('products').update(payload).eq('id', id).select().single()
        : await supabase.from('products').insert(payload).select().single();

      if (pError) throw pError;
      productId = pResult.id;

      await supabase.from('product_variants').delete().eq('product_id', productId);
      if (tierConfig.length > 0 && variants.length > 0) {
        await supabase.from('product_variants').insert(variants.map(v => ({
          product_id: productId,
          tier_values: v.tier_values,
          price: parseFloat(v.price),
          original_price: v.original_price ? parseFloat(v.original_price) : null,
          stock: parseInt(v.stock),
          sku: v.sku
        })));
      }

      await supabase.from('product_attributes').delete().eq('product_id', productId);
      const attrPayloads = Object.entries(productAttrs)
        .filter(([, values]) => values.length > 0)
        .map(([attrId, values]) => ({
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
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild><Link to="/admin/products"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="btn-hero px-10 rounded-xl shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu sản phẩm
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProductDetailSection 
            formData={formData} 
            setFormData={setFormData} 
            availableAttributes={allAttributes} 
            productAttrs={productAttrs} 
            handleAttributeChange={handleAttributeChange}
          />

          <PricingCategorySection 
            formData={formData} 
            setFormData={setFormData} 
            categories={categories} 
            attributes={allAttributes}
            tierConfig={tierConfig}
            setTierConfig={setTierConfig}
            variants={variants}
            setVariants={setVariants}
          />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <ProductStatusSection formData={formData} setFormData={setFormData} />
        </div>
      </div>

      <div className="space-y-8 mt-8">
        <ProductMediaSection formData={formData} setFormData={setFormData} />
        
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Box className="w-4 h-4" /> Gợi ý phối đồ
          </h3>
          <CrossSellSection formData={formData} setFormData={setFormData} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}