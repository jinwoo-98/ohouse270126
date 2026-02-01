import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Loader2, Save, ListFilter, Layers, Zap, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

const FILTER_TYPES = [
  { type: 'style', label: 'Phong Cách', icon: Layers, color: 'bg-blue-100 text-blue-600' },
  { type: 'material', label: 'Chất Liệu', icon: Zap, color: 'bg-amber-100 text-amber-600' },
  { type: 'color', label: 'Màu Sắc', icon: Palette, color: 'bg-purple-100 text-purple-600' },
];

export function LookbookFilterManager() {
  const [filters, setFilters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lookbook_filters')
        .select('*')
        .order('type')
        .order('value');

      if (error) throw error;
      setFilters(data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu bộ lọc.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      type: formData.get('type'),
      value: formData.get('value'),
    };

    if (!payload.type || !payload.value) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      setSaving(false);
      return;
    }

    try {
      if (editingFilter?.id) {
        await supabase.from('lookbook_filters').update(payload).eq('id', editingFilter.id);
      } else {
        await supabase.from('lookbook_filters').insert(payload);
      }
      toast.success("Đã lưu tùy chọn bộ lọc.");
      setIsOpen(false);
      fetchFilters();
    } catch (e: any) { 
      if (e.code === '23505') {
        toast.error("Giá trị này đã tồn tại trong hệ thống.");
      } else {
        toast.error("Lỗi lưu dữ liệu: " + e.message); 
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa tùy chọn...");
    try {
      await supabase.from('lookbook_filters').delete().eq('id', deleteId);
      toast.success("Đã xóa thành công.", { id: toastId });
      fetchFilters();
    } catch (e) {
      toast.error("Lỗi xóa.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const groupedFilters = FILTER_TYPES.map(type => ({
    ...type,
    items: filters.filter(f => f.type === type.type)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingFilter({}); setIsOpen(true); }} className="btn-hero h-10 shadow-gold">
          <Plus className="w-4 h-4 mr-2" /> Thêm Tùy Chọn Mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {groupedFilters.map(group => (
            <div key={group.type} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-xl ${group.color}`}>
                <group.icon className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-widest">{group.label}</h3>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {group.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Chưa có tùy chọn nào.</p>
                ) : (
                  group.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary transition-colors">
                      <span className="text-sm font-medium text-charcoal">{item.value}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => { setEditingFilter(item); setIsOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader><DialogTitle>{editingFilter?.id ? "Chỉnh sửa Tùy chọn" : "Thêm Tùy Chọn Mới"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label>Loại Bộ Lọc</Label>
              <Select name="type" defaultValue={editingFilter?.type} disabled={!!editingFilter?.id}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn loại (Phong cách, Chất liệu...)" /></SelectTrigger>
                <SelectContent>
                  {FILTER_TYPES.map(t => (
                    <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giá trị (Tên hiển thị)</Label>
              <Input name="value" defaultValue={editingFilter?.value} required className="h-11 rounded-xl" placeholder="VD: Hiện đại, Gỗ Sồi, Xám" />
              <p className="text-[10px] text-muted-foreground italic">Giá trị này phải là duy nhất trong mỗi loại.</p>
            </div>
            <Button type="submit" disabled={saving} className="w-full btn-hero h-12 shadow-gold">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Tùy Chọn
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tùy chọn"
        description="Xóa tùy chọn này có thể ảnh hưởng đến các Lookbook đang sử dụng giá trị này. Bạn có chắc chắn muốn xóa?"
        confirmText="Vẫn xóa"
      />
    </div>
  );
}