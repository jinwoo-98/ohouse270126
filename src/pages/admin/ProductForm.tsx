import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Box, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { useDebounce } from "use-debounce";

// Import các section
import { ProductDetailSection } from "@/components/admin/product-form/ProductDetailSection";
import { ProductOrganizationSection } from "@/components/admin/product-form/ProductOrganizationSection";
import { ProductStatusSection } from "@/components/admin/product-form/ProductStatusSection";
import { ProductMediaSection } from "@/components/admin/product-form/ProductMediaSection";
import { CrossSellSection } from "@/components/admin/product-form/CrossSellSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VariantConfigSection } from "@/components/admin/product-form/VariantConfigSection";
import { VariantList } from "@/components/admin/product-form/VariantList";

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const draftKey = `ohouse_draft_product_${id || 'new'}`;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allAttributes, setAllAttributes] = useState<any[]>([]);
  const [allVariantOptions, setAllVariantOptions] = useState<any[]>([]); 
  
  const [tierConfig, setTierConfig] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [productAttrs, setProductAttrs] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  
  const isRestoring = useRef(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');

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

  const [debouncedSlug] = useDebounce(formData.slug, 500);

  useUnsavedWarning(isDirty);

  useEffect(() => {
    fetchInitialData();
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setHasDraft(true);
    }
  }, [id]);

  useEffect(() => {
    if (isDirty && !isRestoring.current && !fetching) {
      const draftData = {
        formData,
        tierConfig,
        variants,
        productAttrs,
        timestamp: Date.now()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }
  }, [formData, tierConfig, variants, productAttrs, isDirty, draftKey, fetching]);

  useEffect(() => {
    if (formData.name && !isRestoring.current) {
      const newSlug = slugify(formData.name);
      if (newSlug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: newSlug }));
        setSlugStatus('idle');
      }
    }
  }, [formData.name]);

  useEffect(() => {
    const checkSlug = async () => {
      if (!debouncedSlug) {
        setSlugStatus('idle');
        return;
      }
      setSlugStatus('checking');
      
      const query = supabase.from('products').select('id').eq('slug', debouncedSlug);
      if (isEdit) query.neq('id', id);
      
      const { data } = await query.limit(1);
      setSlugStatus(data && data.length > 0 ? 'taken' : 'available');
    };
    checkSlug();
  }, [debouncedSlug, id, isEdit]);

  // Logic sinh biến thể
  useEffect(() => {
    if (isRestoring.current) return;
    const validTiers = tierConfig.filter(t => t.name && t.values.length > 0);
    if (validTiers.length === 0) {
      if (variants.length > 0) setVariants([]);
      return;
    }

    const generateCombinations = (tiers: any[], index = 0, current: any = {}): any[] => {
      if (index === tiers.length) return [current];
      const tier = tiers[index];
      let res: any[] = [];
      tier.values.forEach((val: any) => {
        const label = typeof val === 'object' ? val.label : val;
        res = res.concat(generateCombinations(tiers, index + 1, { ...current, [tier.name]: label }));
      });
      return res;
    };

    const combinations = generateCombinations(validTiers);
    const newVariants = combinations.map(combo => {
      const existing = variants.find(v => JSON.stringify(v.tier_values) === JSON.stringify(combo));
      return existing || {
        tier_values: combo,
        price: formData.price || "",
        original_price: formData.original_price || "",
        stock: 999,
        sku: "",
        image_url: ""
      };
    });

    if (JSON.stringify(newVariants.map(v => v.tier_values)) !== JSON.stringify(variants.map(v => v.tier_values))) {
      setVariants(newVariants);
      setIsDirty(true);
    }
  }, [tierConfig, formData.price, formData.original_price]);

  const fetchInitialData = async () => {
    setFetching(true);
    
    let productsQuery = supabase.from('products').select('id, name, image_url').limit(1000);
    if (id) {
      productsQuery = productsQuery.neq('id', id);
    }

    const [cats, prods, attrs, varOpts] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      productsQuery,
      supabase.from('attributes').select('*').order('name'),
      supabase.from('variant_options').select('*').order('name')
    ]);
    
    setCategories(cats.data || []);
    setAllProducts(prods.data || []);
    setAllAttributes(attrs.data || []);
    setAllVariantOptions(varOpts.data || []); 
    
    if (isEdit) await fetchProduct();
    setFetching(false);
    setIsDirty(false);
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

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      isRestoring.current = true;
      const { formData: dForm, tierConfig: dTier, variants: dVar, productAttrs: dAttr } = JSON.parse(savedDraft);
      setFormData(dForm);
      setTierConfig(dTier);
      setVariants(dVar);
      setProductAttrs(dAttr);
      setHasDraft(false);
      setIsDirty(true);
      toast.success("Đã khôi phục bản nháp thành công!");
      setTimeout(() => { isRestoring.current = false; }, 1500);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    setHasDraft(false);
  };

  const handleAttributeChange = (attrId: string, value: any, isMulti: boolean) => {
    if (isRestoring.current) return;
    setIsDirty(true);
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
    if (slugStatus === 'taken') {
      toast.error("Đường dẫn (slug) đã tồn tại. Vui lòng chọn tên khác.");
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
          stock: 999,
          sku: v.sku,
          image_url: v.image_url || null
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

      localStorage.removeItem(draftKey);
      setIsDirty(false);
      
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
        <div className="flex items-center gap-3">
          {isDirty && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse mr-2">Đã thay đổi (Chưa lưu)</span>}
          <Button onClick={handleSubmit} disabled={loading || slugStatus === 'taken' || slugStatus === 'checking'} className="btn-hero px-10 rounded-xl shadow-gold">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu sản phẩm
          </Button>
        </div>
      </div>

      {hasDraft && (
        <Alert className="mb-8 bg-amber-50 border-amber-200 rounded-2xl shadow-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <AlertTitle className="text-amber-800 font-bold">Phát hiện bản nháp chưa hoàn tất!</AlertTitle>
              <AlertDescription className="text-amber-700 text-xs">
                Hệ thống tìm thấy dữ liệu bạn đã nhập trước đó nhưng chưa lưu. Bạn có muốn khôi phục lại không?
              </AlertDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearDraft} className="text-amber-800 hover:bg-amber-100 text-[10px] font-bold uppercase">Bỏ qua</Button>
              <Button size="sm" onClick={restoreDraft} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold uppercase gap-2">
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục ngay
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProductDetailSection 
            formData={formData} 
            setFormData={(data) => { setFormData(data); if (!isRestoring.current && !fetching) setIsDirty(true); }} 
            availableAttributes={allAttributes} 
            productAttrs={productAttrs} 
            handleAttributeChange={handleAttributeChange}
            slugStatus={slugStatus}
          />

          <ProductOrganizationSection 
            formData={formData} 
            setFormData={(data) => { setFormData(data); if (!isRestoring.current && !fetching) setIsDirty(true); }} 
            categories={categories} 
            hasVariants={tierConfig.length > 0}
          />

          <VariantConfigSection
            variantOptions={allVariantOptions} 
            tierConfig={tierConfig}
            setTierConfig={(config) => { setTierConfig(config); if (!isRestoring.current && !fetching) setIsDirty(true); }}
          />

          {variants.length > 0 && (
            <VariantList
              variants={variants}
              setVariants={(v) => { setVariants(v); if (!isRestoring.current && !fetching) setIsDirty(true); }}
            />
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
          <ProductStatusSection formData={formData} setFormData={(data) => { setFormData(data); if (!isRestoring.current && !fetching) setIsDirty(true); }} />
        </div>
      </div>

      <div className="space-y-8 mt-8">
        <ProductMediaSection formData={formData} setFormData={(data) => { setFormData(data); if (!isRestoring.current && !fetching) setIsDirty(true); }} />
        
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Box className="w-4 h-4" /> Gợi ý phối đồ
          </h3>
          <CrossSellSection formData={formData} setFormData={(data) => { setFormData(data); if (!isRestoring.current && !fetching) setIsDirty(true); }} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}