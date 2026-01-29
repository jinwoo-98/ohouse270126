import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import new modular components
import { PricingCategorySection } from "@/components/admin/product-form/PricingCategorySection";
import { CrossSellSection } from "@/components/admin/product-form/CrossSellSection";
import { ProductDetailSection } from "@/components/admin/product-form/ProductDetailSection";
import { ProductMediaSection } from "@/components/admin/product-form/ProductMediaSection";
import { ProductStatusSection } from "@/components/admin/product-form/ProductStatusSection";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  // Attributes state
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
    } else {
      setAvailableAttributes([]);
    }
  }, [formData.category_id, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .order('display_order', { ascending: true });
    setCategories(data || []);
  };

  const fetchAllProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').neq('id', id || 'new').limit(200);
    setAllProducts(data || []);
  };

  const fetchAttributesForCategory = async (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    if (!category) return;

    const targetCategoryIds = [category.id];
    if (category.parent_id) targetCategoryIds.push(category.parent_id);

    const { data: links } = await supabase
      .from('category_attributes')
      .select('attribute_id')
      .in('category_id', targetCategoryIds);
    
    if (links && links.length > 0) {
      const attrIds = links.map(l => l.attribute_id);
      const { data: attrs } = await supabase
        .from('attributes')
        .select('*')
        .in('id', attrIds);
      
      setAvailableAttributes(attrs || []);
    } else {
      setAvailableAttributes([]);
    }
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
          gallery_urls: data.gallery_urls || [],
          material: data.material || "",
          style: data.style || "",
          is_featured: data.is_featured,
          is_new: data.is_new,
          is_sale: data.is_sale,
          display_order: data.display_order?.toString() || "1000",
          fake_sold: data.fake_sold?.toString() || "0",
          fake_review_count: data.fake_review_count?.toString() || "0",
          fake_rating: data.fake_rating?.toString() || "5",
          perfect_match_ids: data.perfect_match_ids || [],
          bought_together_ids: data.bought_together_ids || []
        });

        const { data: pAttrs } = await supabase
          .from('product_attributes')
          .select('*')
          .eq('product_id', id);
        
        if (pAttrs) {
          const loadedAttrs: Record<string, any> = {};
          pAttrs.forEach(item => {
            loadedAttrs[item.attribute_id] = item.value;
          });
          setProductAttrs(loadedAttrs);
        }
      }
    } catch (error) {
      toast.error("Không tìm thấy sản phẩm");
      navigate("/admin/products");
    } finally {
      setFetching(false);
    }
  };

  const handleAttributeChange = (attrId: string, value: any, isMulti: boolean) => {
    setProductAttrs(prev => {
      if (isMulti) {
        const currentVals = (prev[attrId] || []) as string[];
        if (currentVals.includes(value)) {
          return { ...prev, [attrId]: currentVals.filter(v => v !== value) };
        } else {
          return { ...prev, [attrId]: [...currentVals, value] };
        }
      } else {
        return { ...prev, [attrId]: [value] };
      }
    });
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
      gallery_urls: formData.gallery_urls,
      material: formData.material,
      style: formData.style,
      is_featured: formData.is_featured,
      is_new: formData.is_new,
      is_sale: formData.is_sale,
      display_order: parseInt(formData.display_order) || 1000,
      fake_sold: parseInt(formData.fake_sold) || 0,
      fake_review_count: parseInt(formData.fake_review_count) || 0,
      fake_rating: parseFloat(formData.fake_rating) || 5,
      perfect_match_ids: formData.perfect_match_ids,
      bought_together_ids: formData.bought_together_ids,
      updated_at: new Date()
    };

    try {
      let productId = id;
      
      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      }

      if (productId) {
        await supabase.from('product_attributes').delete().eq('product_id', productId);
        const attrPayloads = Object.entries(productAttrs).map(([attrId, val]) => ({
          product_id: productId,
          attribute_id: attrId,
          value: val
        })).filter(item => item.value && item.value.length > 0);

        if (attrPayloads.length > 0) {
          await supabase.from('product_attributes').insert(attrPayloads);
        }
      }

      toast.success(isEdit ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
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
          <PricingCategorySection 
            formData={formData} 
            setFormData={setFormData} 
            categories={categories} 
          />
          <CrossSellSection 
            formData={formData} 
            setFormData={setFormData} 
            allProducts={allProducts} 
          />
          <ProductDetailSection 
            formData={formData} 
            setFormData={setFormData} 
            availableAttributes={availableAttributes}
            productAttrs={productAttrs}
            handleAttributeChange={handleAttributeChange}
          />
        </div>

        <div className="space-y-6">
          <ProductMediaSection 
            formData={formData} 
            setFormData={setFormData} 
          />
          <ProductStatusSection 
            formData={formData} 
            setFormData={setFormData} 
          />
        </div>
      </form>
    </div>
  );
}