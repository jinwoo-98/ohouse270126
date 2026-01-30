"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ShopTheLookManager() {
  const [looks, setLooks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<any>(null);
  const [lookItems, setLookItems] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: l } = await supabase.from('shop_looks').select('*, shop_look_items(*)').order('display_order');
    const { data: p } = await supabase.from('products').select('id, name');
    const { data: c } = await supabase.from('categories').select('id, name, slug, parent_id').order('name');
    
    setLooks(l || []);
    setProducts(p || []);
    setCategories(c || []);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const lookPayload = { 
      title: formData.get('title'), 
      category_id: editingLook?.category_id, 
      image_url: editingLook?.image_url, 
      gallery_urls: editingLook?.gallery_urls || [], // Lưu ảnh phụ
      is_active: true 
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
          y_position: i.y_position 
        })));
      }
      toast.success("Đã lưu Lookbook");
      setIsOpen(false);
      fetchData();
    } catch (e) { toast.error("Lỗi lưu dữ liệu"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa?")) return;
    await supabase.from('shop_looks').delete().eq('id', id);
    fetchData();
  };

  const handleRemoveGalleryImage = (index: number) => {
    setEditingLook((prev: any) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_: any, i: number) => i !== index)
    }));
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-end"><Button onClick={() => { setEditingLook({ gallery_urls: [] }); setLookItems([]); setIsOpen(true); }} className="btn-hero h-10 shadow-gold"><Plus className="w-4 h-4 mr-2" /> Thêm Look</Button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {looks.map(look => {
          const categoryName = categories.find(c => c.slug === look.category_id)?.name || look.category_id;
          return (
            <div key={look.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
              <div className="relative aspect-square">
                <img src={look.image_url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <Button size="sm" variant="secondary" onClick={() => { setEditingLook(look); setLookItems(look.shop_look_items || []); setIsOpen(true); }}><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(look.id)}><Trash2 className="w-4 h-4" /></Button>
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
                            {categories.filter(c => c.parent_id === parent.id).map(child => (
                              <SelectItem key={child.id} value={child.slug}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground italic">Lookbook sẽ hiển thị ở cuối trang danh mục này.</p>
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
                          if (!lookItems.find(i => i.product_id === p.id)) {
                            setLookItems([...lookItems, { product_id: p.id, product_name: p.name, x_position: 50, y_position: 50 }]);
                          }
                        }}
                      >
                        <span className="truncate">{p.name}</span>
                        <Plus className="w-3 h-3 text-primary" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-2 border-t border-dashed border-border/50">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Vị trí Hotspot ({lookItems.length})</Label>
                    <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                      {lookItems.map((item, idx) => (
                        <div key={item.product_id} className="bg-white p-3 rounded-lg text-[10px] space-y-2 shadow-sm border border-border/50">
                          <div className="flex justify-between font-bold text-charcoal">
                            <span className="truncate max-w-[150px]">{item.product_name}</span>
                            <button type="button" onClick={()=>setLookItems(lookItems.filter((_,i)=>i!==idx))} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-3 h-3" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-[9px] text-muted-foreground">Vị trí X (%)</span>
                              <Slider value={[item.x_position]} max={100} onValueChange={([v])=>{const n=[...lookItems]; n[idx].x_position=v; setLookItems(n);}} />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-muted-foreground">Vị trí Y (%)</span>
                              <Slider value={[item.y_position]} max={100} onValueChange={([v])=>{const n=[...lookItems]; n[idx].y_position=v; setLookItems(n);}} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Ảnh chính & Hotspot Preview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ảnh chính (Hotspot)</h3>
                  <ImageUpload value={editingLook?.image_url} onChange={(url) => setEditingLook({...editingLook, image_url: url})} />
                  
                  <div className="bg-gray-100 rounded-2xl relative aspect-square overflow-hidden border border-border/50 shadow-inner">
                    {editingLook?.image_url ? (
                      <>
                        <img src={editingLook.image_url} className="w-full h-full object-cover" />
                        {lookItems.map((item, i) => (
                          <div 
                            key={item.product_id} 
                            className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-xs transform -translate-x-1/2 -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" 
                            style={{left:`${item.x_position}%`, top:`${item.y_position}%`}}
                            title={item.product_name}
                          >
                            +
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Chưa có ảnh</div>
                    )}
                  </div>
                </div>

                {/* Ảnh phụ */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Bộ sưu tập ảnh phụ
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {(editingLook?.gallery_urls || []).map((url: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
                    <ImageUpload 
                      multiple
                      value={editingLook?.gallery_urls || []}
                      onChange={(urls) => setEditingLook((prev: any) => ({ ...prev, gallery_urls: urls as string[] }))} 
                    />
                    <p className="text-[10px] text-muted-foreground mt-3 text-center italic">Chọn nhiều ảnh cùng lúc để tải lên bộ sưu tập.</p>
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
    </div>
  );
}