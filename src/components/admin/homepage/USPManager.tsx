"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Loader2, Save, GripVertical, Truck, RefreshCw, Shield, CreditCard, Gift, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Truck: { icon: Truck, label: "Truck (Vận chuyển)" }, 
  RefreshCw: { icon: RefreshCw, label: "RefreshCw (Đổi trả)" }, 
  Shield: { icon: Shield, label: "Shield (Bảo hành)" }, 
  CreditCard: { icon: CreditCard, label: "CreditCard (Thanh toán)" }, 
  Gift: { icon: Gift, label: "Gift (Quà tặng)" }, 
  HelpCircle: { icon: HelpCircle, label: "HelpCircle (Hỗ trợ)" }
};

export function USPManager() {
  const [usps, setUsps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUsp, setEditingUsp] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchUSPs();
  }, []);

  const fetchUSPs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usps')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setUsps(data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu USP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      icon_name: formData.get('icon_name'),
    };

    if (!payload.title || !payload.description || !payload.icon_name) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      if (editingUsp?.id) {
        await supabase.from('usps').update(payload).eq('id', editingUsp.id);
      } else {
        await supabase.from('usps').insert({ ...payload, display_order: usps.length + 1 });
      }
      toast.success("Đã lưu USP.");
      setIsOpen(false);
      fetchUSPs();
    } catch (e) { toast.error("Lỗi lưu dữ liệu."); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa USP...");
    try {
      await supabase.from('usps').delete().eq('id', deleteId);
      toast.success("Đã xóa USP thành công.", { id: toastId });
      fetchUSPs();
    } catch (e) {
      toast.error("Lỗi khi xóa.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const newUsps = Array.from(usps);
    const [reorderedItem] = newUsps.splice(source.index, 1);
    newUsps.splice(destination.index, 0, reorderedItem);

    setUsps(newUsps);

    try {
      const promises = newUsps.map((item, index) => 
        supabase
          .from('usps')
          .update({ display_order: index + 1 })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
      toast.success("Đã cập nhật vị trí USP");
    } catch (error) {
      toast.error("Lỗi khi lưu vị trí");
      fetchUSPs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingUsp({}); setIsOpen(true); }} className="btn-hero h-10 shadow-gold">
          <Plus className="w-4 h-4 mr-2" /> Thêm USP mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : usps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Chưa có USP nào.</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="usps-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {usps.map((usp, index) => {
                  const Icon = iconMap[usp.icon_name]?.icon || Truck;
                  return (
                    <Draggable key={usp.id} draggableId={usp.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-all",
                            snapshot.isDragging ? "shadow-elevated scale-[1.01] border-primary/40 z-50" : ""
                          )}
                        >
                          <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing px-1">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-charcoal truncate">{usp.title}</h3>
                            <p className="text-xs text-muted-foreground truncate">{usp.description}</p>
                          </div>

                          <div className="flex gap-1 border-l border-border/50 pl-4">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" onClick={() => { setEditingUsp(usp); setIsOpen(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(usp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader><DialogTitle>{editingUsp?.id ? "Chỉnh sửa USP" : "Thêm USP mới"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input name="title" defaultValue={editingUsp?.title} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea name="description" defaultValue={editingUsp?.description} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select name="icon_name" defaultValue={editingUsp?.icon_name || 'Truck'}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(iconMap).map(([key, item]) => (
                    <SelectItem key={key} value={key}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full btn-hero h-12 shadow-gold">
              <Save className="w-4 h-4 mr-2" /> Lưu USP
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa USP"
        description="Hành động này sẽ xóa vĩnh viễn USP khỏi trang chủ."
        confirmText="Vẫn xóa"
      />
    </div>
  );
}