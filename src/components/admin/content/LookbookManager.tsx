"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Search, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function LookbookManager() {
  const [looks, setLooks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<any>(null);
  const [lookItems, setLookItems] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [activeEditingImage, setActiveEditingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: l } = await supabase.from('shop_looks').select('*, shop_look_items(*)').order('display_order');
    const { data: p } = await supabase.from('products').select('id, name, image_url, slug');
    const { data: c } = await supabase.from('categories').select('id, name, slug, parent_id, menu_location').order('name');
    
    setLooks(l || []);
    setProducts(p || []);
    setCategories(c || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const lookPayload = { 
      title: formData.get('title'), 
      category_id: editingLook?.category_id, 
      image_url: editingLook?.image_url, 
      gallery_urls: editingLook?.gallery_urls || [],
      is_active: editingLook?.is_active ?? true
    };

    if (!lookPayload.image_url) { toast.error("Thiếu ảnh chính"); return; }
    if (!lookPayload.category_id) { toast.error("Vui lòng chọn danh mục hiển thị"); return; }

    try {
      let lookId = editingLook?.id;
      if (lookId) {
        await supabase.from('shop_looks').update(lookPayload).eq('id', lookId);
        await supabase.from('shop_look_items').delete().eq('look_id', lookId);
      } else {
        const { data } = await supabase.from('shop_looks').insert(lookPayload).select().single();
        lookId = data.id;
      }

      if (lookItems.length > 0) {
        await supabase.from('shop_look_items').insert(lookItems.map(i => ({ 
          look_id: lookId, 
          product_id: i.product_id, 
          x_position: i.x_position, 
          y_position: i.y_position,
          target_image_url: i.target_image_url
        })));
      }
      toast.success("Đã lưu Lookbook");
      setIsOpen(false);
      fetchData();
    } catch (e) { toast.error("Lỗi lưu dữ liệu"); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa Lookbook...");
    try {
      await supabase.from('shop_looks').delete().eq('id', deleteId);
      toast.success("Đã xóa Lookbook thành công.", { id: toastId });
      fetchData();
    } catch (e) {
      toast.error("Lỗi xóa Lookbook.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('shop_looks').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast.error("Lỗi cập nhật trạng thái.");
    } else {
      toast.success("Đã đổi trạng thái hiển thị.");
      fetchData();
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setEditingLook((prev: any) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_: any, i: number) => i !== index)
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const parentCategories = categories.filter(c => !c.parent_id && c.menu_location === 'main');

  const allEditingImages = [editingLook?.image_url, ...(editingLook?.gallery_urls || [])].filter(Boolean);

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingLook({ gallery_urls: [], is_active: true, category_id: parentCategories[0]?.slug || '' }); setLookItems([]); setActiveEditingImage(null); setIsOpen(true); }} className="btn-hero h-10 shadow-gold">
          <Plus className="w-4 h-4 mr-2" /> Thêm Look
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {looks.map(look => {
            const categoryName = categories.find(c => c.slug === look.category_id)?.name || look.category_id;
            return (
              <div key={look.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
                <div className="relative aspect-square">
                  <img src={look.image_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <Button size="sm" variant="secondary" onClick={() => { setEditingLook(look); setLookItems(look.shop_look_items || []); setActiveEditingImage(look.image_url); setIsOpen(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(look.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Switch checked={look.is_active} onCheckedChange={() => toggleActive(look.id, look.is_active)} />
                  </div>
                </div>
                <div className="p-4 text-center">
                  <Badge variant="secondary" className="mb-2 uppercase text-[9px] bg-primary/10 text-primary border-none">{categoryName}</Badge>
                  <h3 className="font-bold text-sm line-clamp-1">{look.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{look.shop_look_items?.length || 0} sản phẩm</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl rounded-3xl h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Cấu Hình Lookbook</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cột 1: Thông tin cơ bản & Sản phẩm */}
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Thông tin cơ bản</h3>
                  <div className="space-y-2">
                    <Label>Tên Lookbook</Label>
                    <Input name="title" defaultValue={editingLook?.title} required placeholder="VD: Phòng khách Bắc Âu" className="h-11 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Hiển thị tại danh mục</Label>
                    <Select value={editingLook?.category_id} onValueChange={(val) => setEditingLook({...editingLook, category_id: val})}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
                      <SelectContent className="max-h-80">
                        {parentCategories.map(parent => (
                          <SelectGroup key={parent.id}>
                            <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                            {/* Cho phép chọn danh mục cha */}
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
                    <Switch checked={editingLook?.is_active} onCheckedChange={(val) => setEditingLook({...editingLook, is_active: val})} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
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
                        onClick={() => {
                          if (!activeEditingImage) {
                            toast.error("Vui lòng chọn ảnh để gắn Hotspot trước.");
                            return;
                          }
                          if (!lookItems.find(i => i.product_id === p.id && i.target_image_url === activeEditingImage)) {
                            setLookItems([...lookItems, { product_id: p.id, product_name: p.name, x_position: 50, y_position: 50, target_image_url: activeEditingImage }]);
                          }
                        }}
                      >
                        <span className="truncate">{p.name}</span>
                        <Plus className="w-3 h-3 text-primary" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-2 border-t border-dashed border-border/50">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Vị trí Hotspot ({lookItems.filter(i => i.target_image_url === activeEditingImage).length})</Label>
                    <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                      {lookItems.filter(i => i.target_image_url === activeEditingImage).map((item, idx) => {
                        const productInfo = products.find(p => p.id === item.product_id);
                        return (
                          <div key={item.product_id} className="bg-white p-3 rounded-lg text-[10px] space-y-2 shadow-sm border border-border/50">
                            <div className="flex justify-between font-bold text-charcoal">
                              <span className="truncate max-w-[150px]">{productInfo?.name || item.product_name}</span>
                              <button type="button" onClick={()=>setLookItems(lookItems.filter(i => i.product_id !== item.product_id || i.target_image_url !== item.target_image_url))} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-3 h-3" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[9px] text-muted-foreground">Vị trí X (%)</span>
                                <Slider value={[item.x_position]} max={100} onValueChange={([v])=>{const n=[...lookItems]; const originalIndex = n.findIndex(i => i.product_id === item.product_id && i.target_image_url === item.target_image_url); if(originalIndex > -1) n[originalIndex].x_position=v; setLookItems(n);}} />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-muted-foreground">Vị trí Y (%)</span>
                                <Slider value={[item.y_position]} max={100} onValueChange={([v])=>{const n=[...lookItems]; const originalIndex = n.findIndex(i => i.product_id === item.product_id && i.target_image_url === item.target_image_url); if(originalIndex > -1) n[originalIndex].y_position=v; setLookItems(n);}} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Ảnh & Hotspot Preview */}
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
                        {lookItems.filter(i => i.target_image_url === activeEditingImage).map((item) => (
                          <div 
                            key={item.product_id} 
                            className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-xs transform -translate-x-1/2 -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" 
                            style={{left:`${item.x_position}%`, top:`${item.y_position}%`}}
                            title={products.find(p => p.id === item.product_id)?.name || item.product_name}
                          >
                            +
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Chọn ảnh để gắn hotspot</div>
                    )}
                  </div>
                </div>

                {/* Ảnh chính & phụ */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Quản lý ảnh</h3>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh chính</Label>
                    <ImageUpload value={editingLook?.image_url} onChange={(url) => { setEditingLook({...editingLook, image_url: url}); setActiveEditingImage(url as string); }} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh phụ</Label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {(editingLook?.gallery_urls || []).map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                          <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
                      <ImageUpload multiple value={editingLook?.gallery_urls || []} onChange={(urls) => setEditingLook((prev: any) => ({ ...prev, gallery_urls: urls as string[] }))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button type="submit" className="btn-hero h-12 px-8 shadow-gold">Lưu Lookbook</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa Lookbook"
        description="Hành động này sẽ xóa vĩnh viễn Lookbook và các sản phẩm gắn thẻ khỏi hệ thống."
        confirmText="Vẫn xóa Lookbook"
      />
    </div>
  );
}