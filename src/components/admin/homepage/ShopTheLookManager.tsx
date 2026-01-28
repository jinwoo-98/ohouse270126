"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { mainCategories } from "@/constants/header-data";

export function ShopTheLookManager() {
  const [looks, setLooks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<any>(null);
  const [lookItems, setLookItems] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: l } = await supabase.from('shop_looks').select('*, shop_look_items(*)').order('display_order');
    const { data: p } = await supabase.from('products').select('id, name');
    setLooks(l || []);
    setProducts(p || []);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lookPayload = { title: formData.get('title'), category_id: editingLook?.category_id, image_url: editingLook?.image_url, is_active: true };

    if (!lookPayload.image_url) { toast.error("Thiếu ảnh"); return; }

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
        await supabase.from('shop_look_items').insert(lookItems.map(i => ({ look_id: lookId, product_id: i.product_id, x_position: i.x_position, y_position: i.y_position })));
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

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-end"><Button onClick={() => { setEditingLook({}); setLookItems([]); setIsOpen(true); }} className="btn-hero h-10 shadow-gold"><Plus className="w-4 h-4 mr-2" /> Thêm Look</Button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {looks.map(look => (
          <div key={look.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
            <div className="relative aspect-square">
              <img src={look.image_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setEditingLook(look); setLookItems(look.shop_look_items || []); setIsOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(look.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="p-4 text-center">
              <Badge variant="outline" className="mb-2 uppercase text-[9px]">{look.category_id}</Badge>
              <h3 className="font-bold">{look.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl rounded-3xl h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Cấu Hình Lookbook</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label>Tên & Danh mục</Label>
                <Input name="title" defaultValue={editingLook?.title} required />
                <Select value={editingLook?.category_id} onValueChange={(val) => setEditingLook({...editingLook, category_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Phòng..." /></SelectTrigger>
                  <SelectContent>{mainCategories.filter(c => c.dropdownKey).map(c => <SelectItem key={c.dropdownKey} value={c.dropdownKey!}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <ImageUpload value={editingLook?.image_url} onChange={(url) => setEditingLook({...editingLook, image_url: url})} />
                <div className="bg-secondary/20 p-4 rounded-xl space-y-4">
                  <Label className="text-xs font-bold">Thêm sản phẩm gắn thẻ</Label>
                  <Select onValueChange={(pid) => setLookItems([...lookItems, { product_id: pid, product_name: products.find(p=>p.id===pid)?.name, x_position: 50, y_position: 50 }])}>
                    <SelectTrigger><SelectValue placeholder="Chọn sản phẩm..." /></SelectTrigger>
                    <SelectContent className="max-h-60">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
                    {lookItems.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg text-[10px] space-y-2">
                        <div className="flex justify-between font-bold"><span>{item.product_name}</span><button onClick={()=>setLookItems(lookItems.filter((_,i)=>i!==idx))}><X className="w-3 h-3 text-destructive" /></button></div>
                        <Slider value={[item.x_position]} max={100} onValueChange={([v])=>{const n=[...lookItems]; n[idx].x_position=v; setLookItems(n);}} />
                        <Slider value={[item.y_position]} max={100} onValueChange={([v])=>{const n=[...lookItems]; n[idx].y_position=v; setLookItems(n);}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-xl relative aspect-square">
                {editingLook?.image_url && <img src={editingLook.image_url} className="w-full h-full object-cover" />}
                {lookItems.map((item, i) => <div key={i} className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-xs transform -translate-x-1/2 -translate-y-1/2" style={{left:`${item.x_position}%`, top:`${item.y_position}%`}}>+</div>)}
              </div>
            </div>
            <Button type="submit" className="w-full btn-hero h-12">Lưu Lookbook</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}