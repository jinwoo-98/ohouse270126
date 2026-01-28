import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Edit, Trash2, Loader2, Save, Image as ImageIcon, 
  MonitorPlay, Zap, Search, Eye, ShoppingBag, PlusCircle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function HomepageManager() {
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [looks, setLooks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); // For search/select
  
  // Slide Form
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);

  // Trending Form
  const [newKeyword, setNewKeyword] = useState("");

  // Shop The Look Form
  const [isLookOpen, setIsLookOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<any>(null);
  const [lookItems, setLookItems] = useState<any[]>([]); // Temp items for editing look

  // Flash Sale / Featured
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('slides').select('*').order('display_order');
    const { data: t } = await supabase.from('trending_keywords').select('*').order('created_at');
    const { data: l } = await supabase.from('shop_looks').select('*, shop_look_items(*)').order('display_order');
    
    setSlides(s || []);
    setTrending(t || []);
    setLooks(l || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, is_sale, is_featured, image_url');
    setProducts(data || []);
  };

  // --- SLIDE LOGIC ---
  const handleSaveSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ... logic save slide (giữ nguyên logic cũ, thêm trường mới)
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: editingSlide?.description, // From RichText
      cta_text: formData.get('cta_text'),
      cta_link: formData.get('cta_link'),
      image_url: editingSlide?.image_url || '',
      is_active: editingSlide?.is_active ?? true,
      text_color: formData.get('text_color'),
      text_align: formData.get('text_align')
    };

    if (!payload.image_url) { toast.error("Thiếu ảnh slide"); return; }

    try {
      if (editingSlide?.id) {
        await supabase.from('slides').update(payload).eq('id', editingSlide.id);
      } else {
        await supabase.from('slides').insert({ ...payload, display_order: slides.length + 1 });
      }
      toast.success("Đã lưu Slide");
      setIsSlideOpen(false);
      fetchData();
    } catch (e) { toast.error("Lỗi lưu slide"); }
  };

  const toggleSlideActive = async (id: string, current: boolean) => {
    await supabase.from('slides').update({ is_active: !current }).eq('id', id);
    fetchData();
  };

  // --- TRENDING LOGIC ---
  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    await supabase.from('trending_keywords').insert({ keyword: newKeyword.trim() });
    setNewKeyword("");
    fetchData();
  };
  const deleteKeyword = async (id: string) => {
    await supabase.from('trending_keywords').delete().eq('id', id);
    fetchData();
  };

  // --- SHOP THE LOOK LOGIC ---
  const handleSaveLook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lookPayload = {
      title: formData.get('title'),
      image_url: editingLook?.image_url,
      is_active: true
    };

    if (!lookPayload.image_url) { toast.error("Thiếu ảnh không gian"); return; }

    try {
      let lookId = editingLook?.id;
      if (lookId) {
        await supabase.from('shop_looks').update(lookPayload).eq('id', lookId);
        // Delete old items to simpler replace logic (or refined update)
        await supabase.from('shop_look_items').delete().eq('look_id', lookId);
      } else {
        const { data } = await supabase.from('shop_looks').insert(lookPayload).select().single();
        lookId = data.id;
      }

      // Insert Items
      if (lookItems.length > 0) {
        const items = lookItems.map(item => ({
          look_id: lookId,
          product_id: item.product_id,
          x_position: item.x_position,
          y_position: item.y_position
        }));
        await supabase.from('shop_look_items').insert(items);
      }

      toast.success("Đã lưu Shop The Look");
      setIsLookOpen(false);
      fetchData();
    } catch (e: any) { toast.error("Lỗi: " + e.message); }
  };

  // --- PRODUCT FLAGS LOGIC ---
  const toggleProductFlag = async (id: string, field: 'is_sale' | 'is_featured', current: boolean) => {
    await supabase.from('products').update({ [field]: !current }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, [field]: !current } : p));
    toast.success("Đã cập nhật trạng thái sản phẩm");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-primary" /> Quản Lý Trang Chủ
        </h1>
        <p className="text-muted-foreground text-sm">Tùy chỉnh toàn diện nội dung hiển thị trên trang chủ.</p>
      </div>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start overflow-x-auto">
          <TabsTrigger value="slides" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Slideshow</TabsTrigger>
          <TabsTrigger value="flash_featured" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Sale & Nổi Bật</TabsTrigger>
          <TabsTrigger value="looks" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Shop The Look</TabsTrigger>
          <TabsTrigger value="trending" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Xu Hướng Tìm Kiếm</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: SLIDES --- */}
        <TabsContent value="slides" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingSlide({ text_color: '#ffffff', text_align: 'center', is_active: true }); setIsSlideOpen(true); }} className="btn-hero h-10 shadow-gold"><Plus className="w-4 h-4 mr-2" /> Thêm Slide</Button>
          </div>
          <div className="grid gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-6 items-center ${!slide.is_active ? 'opacity-60' : ''}`}>
                <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-secondary/30 shrink-0 border group">
                  <img src={slide.image_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">{slide.is_active ? 'Hiển thị' : 'Đang ẩn'}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{slide.subtitle}</p>
                  <h3 className="font-bold text-lg">{slide.title}</h3>
                  <div className="text-xs text-muted-foreground line-clamp-1" dangerouslySetInnerHTML={{ __html: slide.description }}></div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={slide.is_active} onCheckedChange={() => toggleSlideActive(slide.id, slide.is_active)} />
                  <Button variant="ghost" size="icon" onClick={() => { setEditingSlide(slide); setIsSlideOpen(true); }}><Edit className="w-4 h-4 text-blue-600" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if(confirm('Xóa?')) { await supabase.from('slides').delete().eq('id', slide.id); fetchData(); } }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* --- TAB 2: FLASH SALE & FEATURED --- */}
        <TabsContent value="flash_featured" className="space-y-6 mt-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input placeholder="Tìm sản phẩm để gán nhãn..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
            <div className="h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="text-xs uppercase text-muted-foreground border-b">
                    <th className="py-3 pl-4">Sản phẩm</th>
                    <th className="py-3 text-center">Flash Sale</th>
                    <th className="py-3 text-center">Nổi Bật (Home)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.slice(0, 50).map(p => (
                    <tr key={p.id} className="hover:bg-secondary/20">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                          <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <Switch checked={p.is_sale} onCheckedChange={(val) => toggleProductFlag(p.id, 'is_sale', !val)} />
                      </td>
                      <td className="py-3 text-center">
                        <Switch checked={p.is_featured} onCheckedChange={(val) => toggleProductFlag(p.id, 'is_featured', !val)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB 3: SHOP THE LOOK --- */}
        <TabsContent value="looks" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingLook({}); setLookItems([]); setIsLookOpen(true); }} className="btn-hero h-10 shadow-gold"><Plus className="w-4 h-4 mr-2" /> Thêm Look Mới</Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {looks.map(look => (
              <div key={look.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
                <div className="relative aspect-square">
                  <img src={look.image_url} className="w-full h-full object-cover" />
                  {look.shop_look_items.map((item: any) => (
                    <div key={item.id} className="absolute w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-primary text-xs font-bold" style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}>+</div>
                  ))}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { 
                      setEditingLook(look); 
                      setLookItems(look.shop_look_items || []); 
                      setIsLookOpen(true); 
                    }}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={async () => { if(confirm('Xóa?')) { await supabase.from('shop_looks').delete().eq('id', look.id); fetchData(); } }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-center">{look.title}</h3>
                  <p className="text-xs text-muted-foreground text-center">{look.shop_look_items.length} sản phẩm gắn thẻ</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* --- TAB 4: TRENDING --- */}
        <TabsContent value="trending" className="space-y-6 mt-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl">
            <div className="flex gap-4 mb-6">
              <Input placeholder="Nhập từ khóa mới..." value={newKeyword} onChange={e => setNewKeyword(e.target.value)} />
              <Button onClick={addKeyword}><Plus className="w-4 h-4 mr-2" /> Thêm</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {trending.map(t => (
                <Badge key={t.id} variant="secondary" className="px-3 py-1.5 text-sm gap-2">
                  {t.keyword}
                  <button onClick={() => deleteKeyword(t.id)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}
      
      {/* 1. Slide Dialog */}
      <Dialog open={isSlideOpen} onOpenChange={setIsSlideOpen}>
        <DialogContent className="max-w-3xl rounded-3xl h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader><DialogTitle>Cấu Hình Slide</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveSlide} className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề chính</Label>
                  <Input name="title" defaultValue={editingSlide?.title} required />
                </div>
                <div className="space-y-2">
                  <Label>Tiêu đề phụ</Label>
                  <Input name="subtitle" defaultValue={editingSlide?.subtitle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Màu chữ</Label>
                    <div className="flex gap-2">
                      <Input type="color" name="text_color" defaultValue={editingSlide?.text_color || '#ffffff'} className="w-12 p-1" />
                      <Input type="text" defaultValue={editingSlide?.text_color || '#ffffff'} disabled className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Căn lề</Label>
                    <Select name="text_align" defaultValue={editingSlide?.text_align || 'center'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Trái</SelectItem>
                        <SelectItem value="center">Giữa</SelectItem>
                        <SelectItem value="right">Phải</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ảnh nền</Label>
                <ImageUpload value={editingSlide?.image_url} onChange={(url) => setEditingSlide(prev => ({...prev, image_url: url}))} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Mô tả chi tiết (Rich Text)</Label>
              <RichTextEditor value={editingSlide?.description || ""} onChange={(val) => setEditingSlide(prev => ({...prev, description: val}))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nút bấm (CTA)</Label><Input name="cta_text" defaultValue={editingSlide?.cta_text} /></div>
              <div className="space-y-2"><Label>Link nút bấm</Label><Input name="cta_link" defaultValue={editingSlide?.cta_link} /></div>
            </div>

            <Button type="submit" className="w-full btn-hero h-12">Lưu Thay Đổi</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Look Dialog */}
      <Dialog open={isLookOpen} onOpenChange={setIsLookOpen}>
        <DialogContent className="max-w-4xl rounded-3xl h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader><DialogTitle>Cấu Hình Shop The Look</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveLook} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2"><Label>Tên không gian</Label><Input name="title" defaultValue={editingLook?.title} required placeholder="Phòng khách hiện đại..." /></div>
                <div className="space-y-2">
                  <Label>Ảnh không gian</Label>
                  <ImageUpload value={editingLook?.image_url} onChange={(url) => setEditingLook(prev => ({...prev, image_url: url}))} />
                </div>
                
                <div className="bg-secondary/20 p-4 rounded-xl space-y-4">
                  <Label className="text-xs font-bold uppercase">Thêm sản phẩm vào ảnh</Label>
                  <Select onValueChange={(pid) => {
                    const product = products.find(p => p.id === pid);
                    if (product) {
                      setLookItems([...lookItems, { product_id: pid, product_name: product.name, x_position: 50, y_position: 50 }]);
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Chọn sản phẩm..." /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                    {lookItems.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border text-xs space-y-2">
                        <div className="flex justify-between font-bold">
                          <span>{item.product_name || item.product_id}</span>
                          <button type="button" onClick={() => setLookItems(lookItems.filter((_, i) => i !== idx))} className="text-destructive"><X className="w-3 h-3" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-[9px]">Vị trí ngang (X: {item.x_position}%)</Label>
                            <Slider value={[item.x_position]} max={100} step={1} onValueChange={([val]) => {
                              const newItems = [...lookItems];
                              newItems[idx].x_position = val;
                              setLookItems(newItems);
                            }} />
                          </div>
                          <div>
                            <Label className="text-[9px]">Vị trí dọc (Y: {item.y_position}%)</Label>
                            <Slider value={[item.y_position]} max={100} step={1} onValueChange={([val]) => {
                              const newItems = [...lookItems];
                              newItems[idx].y_position = val;
                              setLookItems(newItems);
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border relative aspect-square">
                {editingLook?.image_url ? (
                  <div className="relative w-full h-full">
                    <img src={editingLook.image_url} className="w-full h-full object-cover" />
                    {lookItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="absolute w-6 h-6 bg-white rounded-full shadow-elevated border-2 border-primary flex items-center justify-center text-primary font-bold text-xs transform -translate-x-1/2 -translate-y-1/2 cursor-help"
                        style={{ left: `${item.x_position}%`, top: `${item.y_position}%` }}
                        title={item.product_name}
                      >
                        +
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Xem trước ảnh</span>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full btn-hero">Lưu Look</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}