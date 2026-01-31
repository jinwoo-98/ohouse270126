import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Loader2, Save, Code, GripVertical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function TrackingManager() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracking_scripts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      toast.error("Lỗi tải mã theo dõi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      location: formData.get('location'),
      script_content: formData.get('script_content'),
      is_active: editingScript?.is_active ?? true,
      display_order: editingScript?.display_order ?? scripts.length + 1,
    };

    if (!payload.name || !payload.script_content || !payload.location) {
      toast.error("Vui lòng điền đầy đủ Tên, Nội dung và Vị trí.");
      setSaving(false);
      return;
    }

    try {
      if (editingScript?.id) {
        await supabase.from('tracking_scripts').update(payload).eq('id', editingScript.id);
      } else {
        await supabase.from('tracking_scripts').insert(payload);
      }
      toast.success("Đã lưu mã theo dõi.");
      setIsOpen(false);
      fetchScripts();
    } catch (e: any) { 
      toast.error("Lỗi lưu dữ liệu: " + e.message); 
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await supabase.from('tracking_scripts').update({ is_active: !current }).eq('id', id);
      setScripts(scripts.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast.success("Đã cập nhật trạng thái.");
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa mã theo dõi...");
    try {
      await supabase.from('tracking_scripts').delete().eq('id', deleteId);
      toast.success("Đã xóa mã theo dõi.", { id: toastId });
      fetchScripts();
    } catch (e) {
      toast.error("Lỗi khi xóa.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const newScripts = Array.from(scripts);
    const [reorderedItem] = newScripts.splice(source.index, 1);
    newScripts.splice(destination.index, 0, reorderedItem);

    setScripts(newScripts);

    try {
      const promises = newScripts.map((item, index) => 
        supabase
          .from('tracking_scripts')
          .update({ display_order: index + 1 })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      toast.success("Đã cập nhật thứ tự hiển thị.");
    } catch (error) {
      toast.error("Lỗi khi lưu thứ tự.");
      fetchScripts();
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Code className="w-7 h-7 text-primary" />
            Quản Lý Mã Theo Dõi (Tracking Scripts)
          </h1>
          <p className="text-muted-foreground text-sm">Thêm các mã GTM, Facebook Pixel, Analytics... vào Header hoặc Body.</p>
        </div>
        <Button onClick={() => { setEditingScript({ location: 'head', is_active: true }); setIsOpen(true); }} className="btn-hero h-11 shadow-gold">
          <Plus className="w-4 h-4 mr-2" /> Thêm Mã Mới
        </Button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
        <p className="text-sm text-blue-800">
          <span className="font-bold">Lưu ý quan trọng:</span> Mã theo dõi sẽ được chèn vào tất cả các trang. Vui lòng chỉ dán mã JavaScript hoặc HTML hợp lệ. Mã ở vị trí `Head` sẽ được tải trước.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Chưa có mã theo dõi nào được thêm.</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="scripts-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {scripts.map((script, index) => (
                  <Draggable key={script.id} draggableId={script.id} index={index}>
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
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-charcoal truncate">{script.name}</h3>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest mt-1">
                            <span className={cn("px-2 py-0.5 rounded-full", script.location === 'head' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600")}>
                              {script.location === 'head' ? 'HEAD' : 'BODY'}
                            </span>
                            <span className="text-muted-foreground">Thứ tự: {script.display_order}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-l border-border/50 pl-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Active</span>
                            <Switch checked={script.is_active} onCheckedChange={() => toggleActive(script.id, script.is_active)} />
                          </div>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" onClick={() => { setEditingScript(script); setIsOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(script.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-elevated">
          <div className="bg-charcoal p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Code className="w-6 h-6" />
                </div>
                <DialogTitle className="text-lg font-bold">{editingScript?.id ? "Chỉnh sửa Mã" : "Thêm Mã Theo Dõi"}</DialogTitle>
              </div>
            </DialogHeader>
          </div>
          <form id="script-form" onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tên mã (VD: GTM, FB Pixel)</Label>
                <Input name="name" defaultValue={editingScript?.name} required className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Vị trí chèn mã</Label>
                <Select name="location" defaultValue={editingScript?.location || 'head'}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Trong thẻ <head></SelectItem>
                    <SelectItem value="body">Ngay sau thẻ <body></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nội dung mã (HTML/JavaScript)</Label>
              <Textarea 
                name="script_content" 
                defaultValue={editingScript?.script_content} 
                required 
                rows={10} 
                placeholder="Dán toàn bộ mã script vào đây..."
                className="rounded-xl font-mono text-xs resize-none"
              />
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={saving} className="btn-hero h-12 px-10 shadow-gold">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Mã
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa mã theo dõi"
        description="Mã này sẽ bị xóa vĩnh viễn khỏi hệ thống và không còn được chèn vào website."
        confirmText="Vẫn xóa mã"
      />
    </div>
  );
}