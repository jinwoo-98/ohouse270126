"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

export function LookbookList() {
  const [looks, setLooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: l } = await supabase.from('shop_looks').select('*, shop_look_items(*)').order('display_order');
    const { data: c } = await supabase.from('categories').select('slug, name');
    
    setLooks(l || []);
    setCategories(c || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('shop_looks').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast.error("Lỗi cập nhật trạng thái.");
    } else {
      toast.success("Đã đổi trạng thái hiển thị.");
      setLooks(prev => prev.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa Lookbook...");
    try {
      // Xóa Lookbook và các item liên quan (ON DELETE CASCADE)
      await supabase.from('shop_looks').delete().eq('id', deleteId);
      toast.success("Đã xóa Lookbook thành công.", { id: toastId });
      fetchData();
    } catch (e) {
      toast.error("Lỗi xóa Lookbook.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredLooks = looks.filter(l => 
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm Lookbook..." 
            className="pl-10 h-11 bg-white rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild className="btn-hero h-11 shadow-gold">
          <Link to="/admin/content/looks/new"><Plus className="w-4 h-4 mr-2" /> Thêm Lookbook</Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLooks.map(look => {
            const categoryName = categories.find(c => c.slug === look.category_id)?.name || look.category_id;
            return (
              <div key={look.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
                <div className="relative aspect-square">
                  <img src={look.image_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/admin/content/looks/edit/${look.id}`}><Edit className="w-4 h-4 mr-2" /> Chỉnh sửa</Link>
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Switch checked={look.is_active} onCheckedChange={() => toggleActive(look.id, look.is_active)} />
                  </div>
                </div>
                <div className="p-4 text-center flex flex-col items-center">
                  <Badge variant="secondary" className="mb-2 uppercase text-[9px] bg-primary/10 text-primary border-none">{categoryName}</Badge>
                  <h3 className="font-bold text-sm line-clamp-1">{look.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> {look.shop_look_items?.length || 0} sản phẩm
                  </p>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 mt-3" onClick={() => setDeleteId(look.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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