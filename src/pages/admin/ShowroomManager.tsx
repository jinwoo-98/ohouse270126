import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  MapPin, 
  Search,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export default function ShowroomManager() {
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('showrooms')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setShowrooms(data || []);
    } catch (error: any) {
      toast.error("Lỗi tải danh sách showroom: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa showroom...");
    try {
      const { error } = await supabase.from('showrooms').delete().eq('id', deleteId);
      if (error) throw error;
      setShowrooms(showrooms.filter(s => s.id !== deleteId));
      toast.success("Đã xóa showroom thành công.", { id: toastId });
    } catch (error: any) {
      toast.error("Lỗi khi xóa: " + error.message, { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };
  
  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('showrooms').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setShowrooms(showrooms.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast.success("Đã cập nhật trạng thái");
    } catch (error: any) { toast.error(error.message); }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const newShowrooms = Array.from(showrooms);
    const [reorderedItem] = newShowrooms.splice(source.index, 1);
    newShowrooms.splice(destination.index, 0, reorderedItem);

    setShowrooms(newShowrooms);

    try {
      const promises = newShowrooms.map((item, index) => 
        supabase
          .from('showrooms')
          .update({ display_order: index + 1 })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
      toast.success("Đã cập nhật vị trí Showroom");
    } catch (error) {
      toast.error("Lỗi khi lưu vị trí");
      fetchShowrooms();
    }
  };

  const filtered = showrooms.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <MapPin className="w-7 h-7 text-primary" />
            Quản Lý Showroom
          </h1>
          <p className="text-muted-foreground text-sm">Thêm, sửa, xóa và sắp xếp các địa điểm showroom.</p>
        </div>
        <Button asChild className="btn-hero shadow-gold px-8 h-12 rounded-xl">
          <Link to="/admin/showrooms/new"><Plus className="w-4 h-4 mr-2" /> Thêm Showroom</Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Tìm theo tên hoặc địa chỉ..." 
          className="pl-10 h-11 bg-white rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Không có showroom nào.</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="showrooms-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {filtered.map((showroom, index) => (
                  <Draggable key={showroom.id} draggableId={showroom.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-all",
                          snapshot.isDragging ? "shadow-elevated scale-[1.01] border-primary/40 z-50" : "",
                          !showroom.is_active && "opacity-60"
                        )}
                      >
                        <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing px-1">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="w-16 h-16 bg-primary/5 rounded-xl overflow-hidden shrink-0 border border-border/50">
                          {showroom.image_url ? <img src={showroom.image_url} className="w-full h-full object-cover" /> : <MapPin className="w-6 h-6 m-auto text-primary" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-charcoal truncate">{showroom.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{showroom.address}</p>
                        </div>

                        <div className="flex items-center gap-4 border-l border-border/50 pl-4">
                          <button 
                            onClick={() => toggleVisibility(showroom.id, showroom.is_active)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all",
                              showroom.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-transparent"
                            )}
                          >
                            {showroom.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span className="hidden sm:inline">{showroom.is_active ? "Hiện" : "Ẩn"}</span>
                          </button>
                          
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" asChild>
                            <Link to={`/admin/showrooms/edit/${showroom.id}`}><Edit className="w-4 h-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(showroom.id)}>
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

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa Showroom"
        description="Hành động này sẽ xóa vĩnh viễn thông tin showroom khỏi hệ thống."
        confirmText="Vẫn xóa"
      />
    </div>
  );
}