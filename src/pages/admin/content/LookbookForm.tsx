import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Search, Image as ImageIcon, Loader2, ArrowLeft, Save, Sparkles, Layers, Zap, Palette, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export default function LookbookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [lookItems, setLookItems] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [activeEditingImage, setActiveEditingImage] = useState<string | null>(null);
  
  const [lookbookFilters, setLookbookFilters] = useState<any[]>([]);

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
    setLoading(false);
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

  const saveLookbook = async (payload: any, lookId?: string) => {
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
      // 1. Generate Slug
      // Nếu người dùng không nhập slug, tự động tạo từ title + 4 ký tự ngẫu nhiên để tránh trùng
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const slugifiedTitle = formData.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
      // Nếu đang edit và slug không đổi, giữ nguyên. Nếu mới hoặc user xóa slug, tạo mới kèm suffix.
      const finalSlug = formData.slug 
        ? formData.slug 
        : (isEdit ? slugifiedTitle : `${slugifiedTitle}-${randomSuffix}`);

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

      try {
        // Thử lưu với Slug
        lookId = await saveLookbook({ ...basePayload, slug: finalSlug }, id);
      } catch (err: any) {
        // Xử lý lỗi cụ thể
        if (err.code === '23505') { // Duplicate key
          toast.error("Đường dẫn (Slug) này đã tồn tại. Vui lòng đổi tiêu đề hoặc nhập slug khác.");
          setSaving(false);
          return;
        } else if (err.message?.includes("column \"slug\" of relation \"shop_looks\" does not exist")) {
          // Fallback: Nếu cột chưa có (do cache), lưu không có slug
          console.warn("Slug column missing, saving without slug...");
          lookId = await saveLookbook(basePayload, id);
          toast.warning("Lưu thành công nhưng chưa tạo được đường dẫn thân thiện (Slug) do hệ thống đang cập nhật.");
        } else {
          throw err; // Ném lỗi khác ra ngoài
        }
      }

      // 2. Sync Look Items (Children)
      if (lookId) {
        // Xóa cũ
        const { error: deleteError } = await supabase
          .from('shop_look_items')
          .delete()
          .eq('look_id', lookId);
        
        if (deleteError) throw deleteError;

        // Thêm mới
        if (lookItems.length > 0) {
          const itemsToInsert = lookItems.map((item) => ({
            look_id: lookId,
            product_id: item.product_id,
            x_position: item.x_position,
            y_position: item.y_position,
            target_image_url: item.target_image_url,
          }));
          
          const { error: itemsError } = await supabase
            .from('shop_look_items')
            .insert(itemsToInsert);
            
          if (itemsError) throw itemsError;
        }
      }

      toast.success("Đã lưu Lookbook thành công!");
      navigate("/admin/content/looks");
    } catch (e: any) {
      console.error("Critical Save Error:", e);
      toast.error("Lỗi không xác định: " + (e.message || e.details || "Vui lòng thử lại"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddLookItem = (product: any) => {
    if (!activeEditingImage) {
      toast.error("Vui lòng chọn ảnh để gắn Hotspot trước.");
      return;
    }
    if (!lookItems.find(i => i.product_id === product.id && i.target_image_url === activeEditingImage)) {
      setLookItems([...lookItems, { product_id: product.id, product_name: product.name, x_position: 50, y_position: 50, target_image_url: activeEditingImage }]);
    }
  };

  const handleRemoveLookItem = (productId: string, targetImage: string) => {
    setLookItems(lookItems.filter(i => !(i.product_id === productId && i.target_image_url === targetImage)));
  };

  const handleUpdateLookItemPosition = (productId: string, targetImage: string, field: 'x_position' | 'y_position', value: number) => {
    setLookItems(prev => prev.map(item => {
      if (item.product_id === productId && item.target_image_url === targetImage) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const parentCategories = categories.filter(c => !c.parent_id && c.menu_location === 'main');
  const allEditingImages = [formData.image_url, ...(formData.gallery_urls || [])].filter(Boolean);
  const lookItemsForActiveImage = lookItems.filter(i => i.target_image_url === activeEditingImage);
  
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
            <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles className="w-4 h-4" /> Thông tin cơ bản</h3>
              <div className="space-y-2">
                <Label>Tên Lookbook</Label>
                <Input name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="VD: Phòng khách Bắc Âu" className="h-11 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label>Đường dẫn (Slug)</Label>
                <Input 
                  name="slug" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="tu-dong-tao-neu-de-trong" 
                  className="h-11 rounded-xl font-mono text-xs" 
                />
                <p className="text-[10px] text-muted-foreground italic">* Để trống để hệ thống tự động tạo (kèm mã ngẫu nhiên để tránh trùng).</p>
              </div>

              <div className="space-y-2">
                <Label>Hiển thị tại danh mục</Label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {parentCategories.map(parent => (
                      <SelectGroup key={parent.id}>
                        <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                        <SelectItem value={parent.slug}>-- Trang chính {parent.name}</SelectItem>
                        {categories.filter(c => c.parent_id === parent.id).map(child => (
                          <SelectItem key={child.id} value={child.slug}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">Lookbook sẽ hiển thị ở cuối trang danh mục này.</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <Label className="text-xs font-bold uppercase">Hiển thị Lookbook</Label>
                <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({...formData, is_active: val})} />
              </div>
            </div>
            
            <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ListFilter className="w-4 h-4" /> Bộ lọc Lookbook</h3>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Layers className="w-3 h-3" /> Phong cách</Label>
                <Select value={formData.style} onValueChange={val => setFormData({...formData, style: val})}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn phong cách..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Không chọn --</SelectItem>
                    {groupedFilters.style.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Zap className="w-3 h-3" /> Chất liệu</Label>
                <Select value={formData.material} onValueChange={val => setFormData({...formData, material: val})}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn chất liệu..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Không chọn --</SelectItem>
                    {groupedFilters.material.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Palette className="w-3 h-3" /> Màu sắc chủ đạo</Label>
                <Select value={formData.color} onValueChange={val => setFormData({...formData, color: val})}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn màu sắc..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Không chọn --</SelectItem>
                    {groupedFilters.color.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-[10px] text-muted-foreground italic">
                Các trường này dùng để lọc Lookbook trên trang Cảm hứng. 
                <Link to="/admin/content/looks/filters" className="text-primary underline ml-1">Quản lý tùy chọn tại đây</Link>.
              </p>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Sản phẩm gắn thẻ</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input 
                  placeholder="Tìm sản phẩm để gắn..." 
                  className="h-9 pl-9 text-xs rounded-xl" 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar border p-2 rounded-xl bg-secondary/20">
                {filteredProducts.slice(0, 10).map(p => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs"
                    onClick={() => handleAddLookItem(p)}
                  >
                    <span className="truncate">{p.name}</span>
                    <Plus className="w-3 h-3 text-primary" />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-2 border-t border-dashed border-border/50">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Vị trí Hotspot ({lookItemsForActiveImage.length})</Label>
                <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                  {lookItemsForActiveImage.map((item) => {
                    const productInfo = products.find(p => p.id === item.product_id);
                    return (
                      <div key={item.product_id} className="bg-white p-3 rounded-lg text-[10px] space-y-2 shadow-sm border border-border/50">
                        <div className="flex justify-between font-bold text-charcoal">
                          <span className="truncate max-w-[150px]">{productInfo?.name || item.product_name}</span>
                          <button type="button" onClick={()=>handleRemoveLookItem(item.product_id, item.target_image_url)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-3 h-3" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground">Vị trí X (%)</span>
                            <Slider 
                              value={[item.x_position]} 
                              max={100} 
                              onValueChange={([v]) => handleUpdateLookItemPosition(item.product_id, item.target_image_url, 'x_position', v)} 
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground">Vị trí Y (%)</span>
                            <Slider 
                              value={[item.y_position]} 
                              max={100} 
                              onValueChange={([v]) => handleUpdateLookItemPosition(item.product_id, item.target_image_url, 'y_position', v)} 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ảnh & Hotspot</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allEditingImages.map(img => (
                  <button key={img} type="button" onClick={() => setActiveEditingImage(img)} className={cn("w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0", activeEditingImage === img ? "border-primary" : "border-transparent")}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-100 rounded-2xl relative aspect-square overflow-hidden border border-border/50 shadow-inner">
                {activeEditingImage ? (
                  <>
                    <img src={activeEditingImage} className="w-full h-full object-cover" />
                    {lookItemsForActiveImage.map((item) => {
                      const productInfo = products.find(p => p.id === item.product_id);
                      return (
                        <div 
                          key={item.product_id} 
                          className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-xs transform -translate-x-1/2 -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" 
                          style={{left:`${item.x_position}%`, top:`${item.y_position}%`}}
                          title={productInfo?.name || item.product_name}
                        >
                          +
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Chọn ảnh để gắn hotspot</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Quản lý ảnh</h3>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh chính</Label>
                <ImageUpload 
                  value={formData.image_url} 
                  onChange={(url) => { 
                    setFormData({...formData, image_url: url as string}); 
                    setActiveEditingImage(url as string); 
                  }} 
                />
              </div>
              <div className="space-y-2 pt-4 border-t border-dashed">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh cho Shop The Look (Trang chủ)</Label>
                <ImageUpload 
                  value={formData.homepage_image_url} 
                  onChange={(url) => setFormData({...formData, homepage_image_url: url as string})} 
                />
                <p className="text-[10px] text-muted-foreground italic">Ảnh này sẽ hiển thị ở mục Shop The Look trên trang chủ. Nếu để trống, sẽ dùng ảnh chính.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh phụ</Label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(formData.gallery_urls || []).map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
                  <ImageUpload 
                    multiple 
                    value={formData.gallery_urls} 
                    onChange={(urls) => setFormData((prev: any) => ({ ...prev, gallery_urls: urls as string[] }))} 
                  />
                </div>
              </div>
            </div>
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