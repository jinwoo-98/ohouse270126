import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import các components mới
import { LookbookBasicInfoSection } from "@/components/admin/content/lookbook-form/LookbookBasicInfoSection";
import { LookbookFilterSection } from "@/components/admin/content/lookbook-form/LookbookFilterSection";
import { LookbookMediaSection } from "@/components/admin/content/lookbook-form/LookbookMediaSection";
import { LookbookHotspotManager } from "@/components/admin/content/lookbook-form/LookbookHotspotManager";

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
  const [initialSlug, setInitialSlug] = useState(""); 

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
    setInitialSlug(lookData.slug || ""); 
    setLookItems(lookData.shop_look_items || []);
    setActiveEditingImage(lookData.image_url);
  };

  // Hàm save wrapper để xử lý retry
  const executeSave = async (payload: any, lookId?: string) => {
    if (lookId) {
      const { error } = await supabase.from('shop_looks').update(payload).eq('id', lookId);
      if (error) throw error;
      return lookId;
    } else {
      const { data, error } = await supabase.from('shop_looks').insert(payload).select().single();
      if (error) throw error;
      return data.id;
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    if (!formData.title) { toast.error("Vui lòng nhập tên Lookbook"); setSaving(false); return; }
    if (!formData.image_url) { toast.error("Thiếu ảnh chính"); setSaving(false); return; }
    if (!formData.category_id) { toast.error("Vui lòng chọn danh mục hiển thị"); setSaving(false); return; }

    try {
      // 1. Generate Slug Logic
      const slugifiedTitle = formData.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
      let finalSlug = formData.slug;
      if (!finalSlug) {
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        finalSlug = `${slugifiedTitle}-${randomSuffix}`;
      }

      // Base Payload (Chưa có slug)
      const basePayload: any = {
        title: formData.title,
        category_id: formData.category_id,
        image_url: formData.image_url,
        gallery_urls: formData.gallery_urls || [],
        is_active: formData.is_active,
        homepage_image_url: formData.homepage_image_url,
        style: formData.style === 'none' ? null : formData.style,
        material: formData.material === 'none' ? null : formData.material,
        color: formData.color === 'none' ? null : formData.color,
        updated_at: new Date().toISOString(),
      };

      let lookId = id;

      // --- LOGIC LƯU THÔNG MINH ---
      try {
        // Lần 1: Thử lưu ĐẦY ĐỦ (kèm slug)
        // Chỉ gửi slug nếu nó khác ban đầu (khi edit) hoặc là tạo mới
        const payloadWithSlug = { ...basePayload };
        if (!isEdit || finalSlug !== initialSlug) {
          payloadWithSlug.slug = finalSlug;
        }
        
        lookId = await executeSave(payloadWithSlug, id);

      } catch (err: any) {
        // Kiểm tra lỗi Schema Cache hoặc lỗi cột Slug
        const errorMessage = err.message?.toLowerCase() || "";
        if (
          errorMessage.includes("schema cache") || 
          errorMessage.includes("column \"slug\"") ||
          errorMessage.includes("could not find the 'slug' column")
        ) {
          console.warn("Schema cache mismatch detected. Retrying without slug...");
          
          // Lần 2: Thử lưu KHÔNG CÓ SLUG (Fallback)
          lookId = await executeSave(basePayload, id);
          
          toast.info("Đã lưu Lookbook thành công (Lưu ý: Đường dẫn Slug chưa được cập nhật do hệ thống đang đồng bộ dữ liệu).");
        } else if (err.code === '23505') { 
          toast.error("Đường dẫn (Slug) này đã tồn tại. Vui lòng đổi tên hoặc nhập slug khác.");
          setSaving(false);
          return;
        } else {
          throw err; // Lỗi khác thì ném ra ngoài
        }
      }

      if (!lookId) throw new Error("Không lấy được ID Lookbook");

      // 2. Sync Look Items (Children)
      if (lookId) {
        const { error: deleteError } = await supabase.from('shop_look_items').delete().eq('look_id', lookId);
        if (deleteError) throw deleteError;

        if (lookItems.length > 0) {
          const itemsToInsert = lookItems.map((item) => ({
            look_id: lookId,
            product_id: item.product_id,
            x_position: item.x_position,
            y_position: item.y_position,
            target_image_url: item.target_image_url,
          }));
          
          const { error: itemsError } = await supabase.from('shop_look_items').insert(itemsToInsert);
          if (itemsError) throw itemsError;
        }
      }

      toast.success("Đã lưu Lookbook thành công!");
      navigate("/admin/content/looks");
    } catch (e: any) {
      console.error("Critical Save Error:", e);
      toast.error("Lỗi hệ thống: " + (e.message || "Vui lòng thử lại sau."));
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
          <h1 className="2xl font-bold">{isEdit ? "Chỉnh sửa Lookbook" : "Tạo Lookbook mới"}</h1>
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