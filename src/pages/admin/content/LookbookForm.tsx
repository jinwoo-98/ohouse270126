import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Save, AlignLeft, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { slugify, cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import các components
import { LookbookBasicInfoSection } from "@/components/admin/content/lookbook-form/LookbookBasicInfoSection";
import { LookbookFilterSection } from "@/components/admin/content/lookbook-form/LookbookFilterSection";
import { LookbookMediaSection } from "@/components/admin/content/lookbook-form/LookbookMediaSection";
import { LookbookHotspotManager } from "@/components/admin/content/lookbook-form/LookbookHotspotManager";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function LookbookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const draftKey = `ohouse_draft_lookbook_${id || 'new'}`;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [lookItems, setLookItems] = useState<any[]>([]);
  const [activeEditingImage, setActiveEditingImage] = useState<string | null>(null);
  
  const [lookbookFilters, setLookbookFilters] = useState<any[]>([]);

  const [isDirty, setIsDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const isRestoring = useRef(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');

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

  const [debouncedSlug] = useDebounce(formData.slug, 500);
  useUnsavedWarning(isDirty);

  useEffect(() => {
    fetchInitialData();
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) setHasDraft(true);
  }, [id]);

  useEffect(() => {
    if (isDirty && !isRestoring.current && !fetching) {
      const draftData = { formData, lookItems, timestamp: Date.now() };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }
  }, [formData, lookItems, isDirty, draftKey, fetching]);

  useEffect(() => {
    if (formData.title && !isRestoring.current) {
      const newSlug = slugify(formData.title);
      if (newSlug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: newSlug }));
        setSlugStatus('idle');
      }
    }
  }, [formData.title]);

  useEffect(() => {
    const checkSlug = async () => {
      if (!debouncedSlug) {
        setSlugStatus('idle');
        return;
      }
      setSlugStatus('checking');
      
      const query = supabase.from('shop_looks').select('id').eq('slug', debouncedSlug);
      if (isEdit) query.neq('id', id);
      
      const { data } = await query.maybeSingle();
      setSlugStatus(data ? 'taken' : 'available');
    };
    checkSlug();
  }, [debouncedSlug, id, isEdit]);

  const fetchInitialData = async () => {
    setFetching(true);
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
      setFetching(false);
      setIsDirty(false);
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

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      isRestoring.current = true;
      const { formData: dForm, lookItems: dItems } = JSON.parse(savedDraft);
      setFormData(dForm);
      setLookItems(dItems);
      setHasDraft(false);
      setIsDirty(true);
      toast.success("Đã khôi phục bản nháp!");
      setTimeout(() => { isRestoring.current = false; }, 1500);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    setHasDraft(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (slugStatus === 'taken') {
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
      
      localStorage.removeItem(draftKey);
      setIsDirty(false);
      toast.success("Đã lưu thành công!");
      navigate("/admin/content/looks");
    } catch (err: any) {
      toast.error("Lỗi lưu dữ liệu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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

  if (fetching) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild><Link to="/admin/content/looks"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa Lookbook" : "Tạo Lookbook mới"}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse mr-2">Đã thay đổi</span>}
          <Button 
            type="submit" 
            form="lookbook-form" 
            disabled={saving || slugStatus === 'taken' || slugStatus === 'checking'} 
            className={cn("btn-hero px-10 rounded-xl shadow-gold", (slugStatus === 'taken' || slugStatus === 'checking') && "opacity-50 cursor-not-allowed")}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Lookbook
          </Button>
        </div>
      </div>

      {hasDraft && (
        <Alert className="mb-8 bg-amber-50 border-amber-200 rounded-2xl shadow-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <AlertTitle className="text-amber-800 font-bold">Phát hiện bản nháp!</AlertTitle>
              <AlertDescription className="text-amber-700 text-xs">
                Hệ thống tìm thấy dữ liệu chưa lưu. Bạn có muốn khôi phục lại không?
              </AlertDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearDraft} className="text-amber-800 hover:bg-amber-100 text-[10px] font-bold uppercase">Bỏ qua</Button>
              <Button size="sm" onClick={restoreDraft} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold uppercase gap-2">
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <form id="lookbook-form" onSubmit={handleSave} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <LookbookBasicInfoSection 
              formData={formData} 
              setFormData={(data) => { setFormData(data); setIsDirty(true); }} 
              categories={categories}
              slugStatus={slugStatus}
            />
            
            <LookbookFilterSection 
              formData={formData} 
              setFormData={(data) => { setFormData(data); setIsDirty(true); }} 
              groupedFilters={groupedFilters} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
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
              <Textarea 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Nhập đoạn giới thiệu chi tiết về không gian này..." 
                className="rounded-xl min-h-[150px] resize-none leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground italic">Mô tả này sẽ hiển thị ở phần giới thiệu trang chi tiết Lookbook.</p>
            </div>

            <LookbookHotspotManager
              products={products}
              lookItems={lookItems}
              setLookItems={(items) => { setLookItems(items); setIsDirty(true); }}
              activeEditingImage={activeEditingImage}
              allEditingImages={allEditingImages}
              setActiveEditingImage={setActiveEditingImage}
            />
            
            <LookbookMediaSection 
              formData={formData} 
              setFormData={(data) => { setFormData(data); setIsDirty(true); }} 
              setActiveEditingImage={setActiveEditingImage}
            />
          </div>
        </div>
      </form>
    </div>
  );
}