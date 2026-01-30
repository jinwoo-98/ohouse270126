"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, Edit, GripVertical, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function FeaturedLookManager() {
  const [looks, setLooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_looks')
        .select('id, title, image_url, is_active, display_order, category_id')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLooks(data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu Lookbook.");
    } finally {
      setLoading(false);
    }
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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const newLooks = Array.from(looks);
    const [reorderedItem] = newLooks.splice(source.index, 1);
    newLooks.splice(destination.index, 0, reorderedItem);

    setLooks(newLooks);

    try {
      const promises = newLooks.map((item, index) => 
        supabase
          .from('shop_looks')
          .update({ display_order: index + 1 })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
      toast.success("Đã cập nhật vị trí Lookbook");
    } catch (error) {
      toast.error("Lỗi khi lưu vị trí");
      fetchLooks();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (looks.length === 0) return <div className="text-center py-12 text-muted-foreground italic">Chưa có Lookbook nào được tạo.</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lookbook-list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {looks.map((look, index) => (
              <Draggable key={look.id} draggableId={look.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-all",
                      snapshot.isDragging ? "shadow-elevated scale-[1.01] border-primary/40 z-50" : "",
                      !look.is_active && "opacity-60"
                    )}
                  >
                    <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing px-1">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="w-16 h-16 bg-primary/5 rounded-xl overflow-hidden shrink-0 border border-border/50">
                      <img src={look.image_url} className="w-full h-full object-cover" alt={look.title} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-charcoal truncate">{look.title}</h3>
                      <p className="text-[10px] text-muted-foreground truncate mt-1 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> {look.category_id}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 border-l border-border/50 pl-4">
                      <button 
                        onClick={() => toggleActive(look.id, look.is_active)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all",
                          look.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-transparent"
                        )}
                      >
                        {look.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span className="hidden sm:inline">{look.is_active ? "Hiện" : "Ẩn"}</span>
                      </button>
                      
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" asChild>
                        <Link to={`/admin/content/looks/edit/${look.id}`}><Edit className="w-4 h-4" /></Link>
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
  );
}