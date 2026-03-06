"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit, X, Check, Tag, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function VariantOptionManager() {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<any>(null);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('variant_options').select('*').order('name');
      if (error) throw error;
      setOptions(data || []);
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingOption?.name?.trim()) {
      toast.error("Tên nhóm không được để trống.");
      return;
    }

    setIsSaving(true);
    const payload = {
      name: editingOption.name.trim(),
      options: editingOption.options || [],
    };

    try {
      if (editingOption.id) {
        const { error } = await supabase.from('variant_options').update(payload).eq('id', editingOption.id);
        if (error) throw error;
        toast.success("Đã cập nhật nhóm phân loại.");
      } else {
        const { error } = await supabase.from('variant_options').insert(payload);
        if (error) throw error;
        toast.success("Đã thêm nhóm phân loại mới.");
      }
      setEditingOption(null);
      fetchOptions();
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('variant_options').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success("Đã xóa thành công.");
      setDeleteId(null);
      fetchOptions();
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const addOptionValue = () => {
    const val = newOptionValue.trim();
    if (!val) return;
    if (editingOption.options?.includes(val)) {
      toast.error("Giá trị này đã tồn tại.");
      return;
    }
    const updatedOptions = [...(editingOption.options || []), val];
    setEditingOption({ ...editingOption, options: updatedOptions });
    setNewOptionValue("");
  };

  const removeOptionValue = (index: number) => {
    const updatedOptions = [...editingOption.options];
    updatedOptions.splice(index, 1);
    setEditingOption({ ...editingOption, options: updatedOptions });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setEditingOption({ name: "", options: [] })} className="btn-hero shadow-gold rounded-xl h-11 px-6">
          <Plus className="w-4 h-4 mr-2" /> Thêm nhóm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-border text-muted-foreground italic">
            Chưa có nhóm phân loại nào. Hãy tạo nhóm đầu tiên (VD: Màu sắc, Kích thước).
          </div>
        ) : options.map(opt => (
          <div key={opt.id} className="bg-white p-6 rounded-3xl border border-border/60 shadow-sm hover:shadow-medium transition-all flex flex-col group">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-charcoal text-lg">{opt.name}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-blue-600 hover:bg-blue-50" onClick={() => setEditingOption(opt)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(opt.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-1 content-start">
              {opt.options?.length > 0 ? (
                <>
                  {opt.options.slice(0, 8).map((val: string) => (
                    <Badge key={val} variant="secondary" className="bg-secondary/50 text-charcoal border-none px-3 py-1">{val}</Badge>
                  ))}
                  {opt.options.length > 8 && <Badge variant="outline" className="border-dashed">+{opt.options.length - 8} nữa</Badge>}
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">Chưa có giá trị gợi ý</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingOption} onOpenChange={(open) => !open && setEditingOption(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[32px] p-0 overflow-hidden border-none shadow-elevated">
          <div className="bg-charcoal p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <List className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold uppercase tracking-widest">
                  {editingOption?.id ? "Chỉnh sửa" : "Thêm mới"} nhóm phân loại
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tên nhóm phân loại (VD: Màu sắc, Kích thước)</label>
              <Input 
                value={editingOption?.name || ""}
                onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                placeholder="Nhập tên nhóm..."
                className="h-12 rounded-xl font-bold text-lg"
              />
            </div>

            <div className="space-y-4 pt-6 border-t border-dashed">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giá trị gợi ý (Dùng để chọn nhanh khi đăng SP)</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Thêm giá trị (VD: Xanh, Đỏ, L, XL...)"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionValue())}
                  className="h-11 rounded-xl"
                />
                <Button type="button" onClick={addOptionValue} variant="secondary" className="h-11 px-6 rounded-xl font-bold">THÊM</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {editingOption?.options?.map((val: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-white h-9 rounded-xl text-sm font-bold px-4 border-border/60 group/badge">
                    {val}
                    <button onClick={() => removeOptionValue(idx)} className="ml-2 p-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
                {(!editingOption?.options || editingOption.options.length === 0) && (
                  <p className="text-xs text-muted-foreground italic">Chưa có giá trị nào được thêm.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setEditingOption(null)} className="rounded-xl h-12 flex-1 font-bold text-xs uppercase">Hủy bỏ</Button>
            <Button onClick={handleSave} disabled={isSaving} className="btn-hero h-12 flex-[2] rounded-xl shadow-gold">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              LƯU THÔNG TIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa nhóm phân loại"
        description="Hành động này sẽ xóa vĩnh viễn nhóm phân loại khỏi danh sách gợi ý. Các sản phẩm đã tạo biến thể trước đó sẽ không bị ảnh hưởng."
        confirmText="Vẫn xóa"
      />
    </div>
  );
}