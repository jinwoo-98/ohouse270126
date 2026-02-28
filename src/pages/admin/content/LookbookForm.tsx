import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Save, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { slugify, cn } from "@/lib/utils";

// Import các components
import { LookbookBasicInfoSection } from "@/components/admin/content/lookbook-form/LookbookBasicInfoSection";
import { LookbookFilterSection } from "@/components/admin/content/lookbook-form/LookbookFilterSection";
import { LookbookMediaSection } from "@/components/admin/content/lookbook-form/LookbookMediaSection";
import { LookbookHotspotManager } from "@/components/admin/content/lookbook-form/LookbookHotspotManager";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";

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

  // Slug states
  const [isSlugDuplicate, setIsSlugDuplicate] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
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

  // 1. Tự động tạo slug khi nhập tiêu đề (Luôn đồng bộ)
  useEffect(() => {
    if (formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(formData.title) }));
    }
  }, [formData.title]);

  // 2. Kiểm tra trùng lặp slug (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.slug) {
        checkSlugUniqueness(formData.slug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.slug]);

  const checkSlugUniqueness = async (slug: string) => {
    let query = supabase.from('shop_looks').select('id').eq('slug', slug);
    if (isEdit) query = query.neq('id', id);
    
    const { data } = await query.maybeSingle();
    setIsSlugDuplicate(!!data);
  };

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
          setFormData(prev => ({ ...prev, category_id: defaultCat.id }));
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
      slug: lookData.slug || slugify(lookData.title),
      description: lookData.description || "",
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
    
    if (isSlugDuplicate) {
      toast.error("Đường dẫn (Slug) đã tồn tại. Vui lòng thay đổi Tên Lookbook.");
      return;
    }

    setSaving(true);
    
    if (!formData.title) { toast.error("Vui lòng nhập tên Lookbook"); setSaving(false); return; }
    if (!formData.image_url) { toast.error("Thiếu ảnh chính"); setSaving(false); return; }
    if (!formData.category_id) { toast.error("Vui lòng chọn danh mục hiển thị"); setSaving(false); return; }

    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      category_id: formData.category_id,
      image_url: formData.image_url,
      gallery_urls: formData.gallery_urls,
      is_active: formData.is_active,
      homepage_image_url: formData.homepage_image_url,
      style: formData.style === 'none' ? null : formData.style,
      material: formData.material === 'none' ? null : formData.material,
      color: formData.color === 'none' ? null : formData.color,
    };

    try {
      let lookId = id;
      const { data: lookResult, error: lookError } = isEdit 
        ? await supabase.from('shop_looks').update(payload).eq('id', id).select().single()
        : await supabase.from('shop_looks').insert(payload).select().single();

      if (lookError || !lookResult) throw lookError;
      lookId = lookResult.id;

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
      
      toast.success("Đã lưu thành công!");
      navigate("/admin/content/looks");
    } catch (err: any) {
      toast.error("Lỗi lưu dữ liệu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Danh sách ảnh để gắn hotspot: Ảnh chính, Ảnh trang chủ, Ảnh Gallery
  const allEditingImages = useMemo(() => {
    const list = [];
    if (formData.image_url) list.push({ url: formData.image_url, label: "Ảnh chính", type: 'main' });
    if (formData.homepage_image_url) list.push({ url: formData.homepage_image_url, label: "Ảnh trang chủ", type: 'homepage' });
    
    (formData.gallery_urls || []).forEach((url, idx) => {
      list.push({ url, label: `Ảnh phụ ${idx + 1}`, type: 'gallery' });
    });
    
    return list;
  }, [formData.image_url, formData.homepage_image_url, formData.gallery_urls]);
  
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
        <Button 
          type="submit" 
          form="lookbook-form" 
          disabled={saving || isSlugDuplicate} 
          className={cn("btn-hero px-10 rounded-xl shadow-gold", isSlugDuplicate && "opacity-50 cursor-not-allowed")}
        >
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
              isSlugDuplicate={isSlugDuplicate}
            />
            
            <LookbookFilterSection 
              formData={formData} 
              setFormData={setFormData} 
              groupedFilters={groupedFilters} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Ô soạn thảo mô tả được di chuyển sang đây để có không gian rộng rãi */}
            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" /> Mô tả chi tiết Lookbook
                </Label>
                <AIContentAssistant 
                  contentType="product" 
                  contextTitle={formData.title} 
                  onInsert={(val) => setFormData({...formData, description: val})} 
                />
              </div>
              <RichTextEditor 
                value={formData.description || ""} 
                onChange={val => setFormData({...formData, description: val})} 
                placeholder="Nhập đoạn giới thiệu chi tiết về không gian này..." 
              />
              <p className="text-[10px] text-muted-foreground italic">Mô tả này sẽ hiển thị ở phần giới thiệu trang chi tiết Lookbook.</p>
            </div>

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
      </form>
    </div>
  );
}