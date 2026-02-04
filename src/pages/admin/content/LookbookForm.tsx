import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import các components
import { LookbookBasicInfoSection } from "@/components/admin/content/lookbook-form/LookbookBasicInfoSection";
import { LookbookFilterSection } from "@/components/admin/content/lookbook-form/LookbookFilterSection";
import { LookbookMediaSection } from "@/components/admin/content/lookbook-form/LookbookMediaSection";
import { LookbookHotspotManager } from "@/components/admin/content/lookbook-form/LookbookHotspotManager";

// Hàm tiện ích tạo slug tiếng Việt
const generateSlug = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Bỏ ký tự đặc biệt
    .replace(/[\s+]/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-"); // Xóa gạch ngang kép
};

export default function LookbookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [lookItems, setLookItems] = useState<any[]>([]);
  const [activeEditingImage, setActiveEditingImage] = useState<string | null>(null);
  
  const [lookbookFilters, setLookbookFilters] = useState<any[]>([]);
  const [isSlugManuallyChanged, setIsSlugManuallyChanged] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category_id: "",
    image_url: "",
    gallery_urls: [] as string[],
    is_active: true,
    homepage_image_url: "",
    style: "none",
    material: "none",
    color: "none",
  });

  // Tự động tạo slug khi title thay đổi (chỉ khi tạo mới và chưa chỉnh sửa thủ công)
  useEffect(() => {
    if (!isEdit && !isSlugManuallyChanged && formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title, isEdit, isSlugManuallyChanged]);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, fRes] = await Promise.all([
        supabase.from('products').select('id, name, image_url, slug'),
        supabase.from('categories').select('id, name, slug, parent_id, menu_location').order('name'),
        supabase.from('lookbook_filters').select('*').order('type').order('value')
      ]);
      
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      setLookbookFilters(fRes.data || []);
      
      if (isEdit) {
        await fetchLookData(id!);
        setIsSlugManuallyChanged(true);
      } else {
        const defaultCat = cRes.data?.find(c => !c.parent_id && c.menu_location === 'main');
        if (defaultCat) {
          setFormData(prev => ({ ...prev, category_id: defaultCat.slug }));
        }
      }
    } catch (e) {
      console.error("Error loading initial data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookData = async (lookId: string) => {
    const { data: lookData, error } = await supabase
      .from('shop_looks')
      .select('*, shop_look_items(*)')
      .eq('id', lookId)
      .single();

    if (error || !lookData) {
      toast.error("Không tìm thấy Lookbook.");
      navigate("/admin/content/looks");
      return;
    }

    setFormData({
      title: lookData.title,
      slug: lookData.slug || "",
      category_id: lookData.category_id,
      image_url: lookData.image_url,
      gallery_urls: lookData.gallery_urls || [],
      is_active: lookData.is_active,
      homepage_image_url: lookData.homepage_image_url || "",
      style: lookData.style || "none",
      material: lookData.material || "none",
      color: lookData.color || "none",
    });
    setLookItems(lookData.shop_look_items || []);
    setActiveEditingImage(lookData.image_url);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    if (!formData.title) { toast.error("Vui lòng nhập tên Lookbook"); setSaving(false); return; }
    if (!formData.image_url) { toast.error("Thiếu ảnh chính"); setSaving(false); return; }
    if (!formData.category_id) { toast.error("Vui lòng chọn danh mục hiển thị"); setSaving(false); return; }

    let finalSlug = formData.slug.trim();
    if (!finalSlug) {
      finalSlug = generateSlug(formData.title);
    }

    const basePayload = {
      title: formData.title,
      slug: finalSlug,
      category_id: formData.category_id,
      image_url: formData.image_url,
      gallery_urls: formData.gallery_urls || [],
      is_active: formData.is_active,
      homepage_image_url: formData.homepage_image_url,
      style: formData.style === 'none' ? null : formData.style,
      material: formData.material === 'none' ? null : formData.material,
      color: formData.color === 'none' ? null : formData.color,
    };

    let lookId = id;
    let lookError = null;
    let slugSavedSuccessfully = true;

    try {
      // 1. Thử lưu payload đầy đủ (bao gồm slug)
      if (isEdit) {
        const { error } = await supabase.from('shop_looks').update(basePayload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('shop_looks').insert(basePayload).select().single();
        if (error) throw error;
        lookId = data.id;
      }
    } catch (mainError: any) {
      // 2. Nếu lỗi liên quan đến schema cache (thường là lỗi 42703 hoặc PGRST116/PGRST204)
      if (mainError.message?.includes('slug') || mainError.code === '42703' || mainError.code === 'PGRST116' || mainError.code === 'PGRST204') {
        console.warn("Lỗi schema cache/cột slug không tồn tại. Đang thử lưu không có slug...");
        
        // Loại bỏ slug khỏi payload
        const { slug, ...payloadNoSlug } = basePayload;
        slugSavedSuccessfully = false;
        
        try {
          if (isEdit) {
            const { error: retryError } = await supabase.from('shop_looks').update(payloadNoSlug).eq('id', id);
            if (retryError) throw retryError;
          } else {
            const { data, error: retryError } = await supabase.from('shop_looks').insert(payloadNoSlug).select().single();
            if (retryError) throw retryError;
            lookId = data.id;
          }
          toast.warning("Đã lưu Lookbook! (Lỗi đồng bộ schema: Link thân thiện tạm thời dùng ID).");
        } catch (retryFatal) {
          toast.error("Lỗi lưu dữ liệu: " + (retryFatal as any).message);
          setSaving(false);
          return;
        }
      } else {
        // Lỗi khác
        toast.error("Lỗi hệ thống: " + mainError.message);
        setSaving(false);
        return;
      }
    }

    // 3. Lưu Look Items
    try {
      if (lookId) {
        await supabase.from('shop_look_items').delete().eq('look_id', lookId);
        if (lookItems.length > 0) {
          const itemsToInsert = lookItems.map((item) => ({
            look_id: lookId,
            product_id: item.product_id,
            x_position: item.x_position,
            y_position: item.y_position,
            target_image_url: item.target_image_url,
          }));
          await supabase.from('shop_look_items').insert(itemsToInsert);
        }
      }
      
      if (slugSavedSuccessfully) {
        toast.success("Đã lưu thành công!");
      }
      navigate("/admin/content/looks");
    } catch (itemError: any) {
      toast.error("Lỗi lưu sản phẩm gắn thẻ: " + itemError.message);
    } finally {
      setSaving(false);
    }
  };

  const allEditingImages = [formData.image_url, ...(formData.gallery_urls || [])].filter(Boolean);
  
  const groupedFilters = useMemo(() => {
    return {
      style: lookbookFilters.filter(f => f.type === 'style').map(f => f.value),
      material: lookbookFilters.filter(f => f.type === 'material').map(f => f.value),
      color: lookbookFilters.filter(f => f.type === 'color').map(f => f.value),
    };
  }, [lookbookFilters]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild><Link to="/admin/content/looks"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa Lookbook" : "Tạo Lookbook mới"}</h1>
        </div>
        <Button type="submit" form="lookbook-form" disabled={saving} className="btn-hero px-10 rounded-xl shadow-gold">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Lookbook
        </Button>
      </div>

      <form id="lookbook-form" onSubmit={handleSave} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <LookbookBasicInfoSection 
              formData={formData} 
              setFormData={setFormData} 
              categories={categories} 
              setIsSlugManuallyChanged={setIsSlugManuallyChanged}
            />
            
            <LookbookFilterSection 
              formData={formData} 
              setFormData={setFormData} 
              groupedFilters={groupedFilters} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <LookbookHotspotManager
              products={products}
              lookItems={lookItems}
              setLookItems={setLookItems}
              activeEditingImage={activeEditingImage}
              allEditingImages={allEditingImages}
              setActiveEditingImage={setActiveEditingImage}
            />
            
            <LookbookMediaSection 
              formData={formData} 
              setFormData={setFormData} 
              setActiveEditingImage={setActiveEditingImage}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button type="submit" disabled={saving} className="btn-hero h-12 px-8 shadow-gold">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Lookbook
          </Button>
        </div>
      </form>
    </div>
  );
}