"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, GripVertical, Link as LinkIcon, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function FeaturedLookManager() {
  const [looks, setLooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // State to hold categories
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    setLoading(true);
    try {
      const [looksRes, catsRes] = await Promise.all([
        supabase
          .from('shop_looks')
          .select('id, title, image_url, is_active, display_order, category_id')
          .order('display_order', { ascending: true }),
        supabase
          .from('categories')
          .select('id, name, slug, parent_id') // Fetch parent_id
      ]);

      if (looksRes.error) throw looksRes.error;
      if (catsRes.error) throw catsRes.error;
      
      setLooks(looksRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu Lookbook.");
    } finally {
      setLoading(false);
    }
  };
  
  const groupedLooks = useMemo(() => {
    const groups: Record<string, { name: string, looks: any[] }> = {};

    looks.forEach(look => {
        const category = categories.find(c => c.id === look.category_id);
        if (!category) return;

        const parent = category.parent_id ? categories.find(p => p.id === category.parent_id) : category;
        if (!parent) return;

        if (!groups[parent.id]) {
            groups[parent.id] = { name: parent.name, looks: [] };
        }
        groups[parent.id].looks.push(look);
    });

    return Object.entries(groups)
        .map(([parentId, data]) => ({
            id: parentId,
            name: data.name,
            looks: data.looks.sort((a, b) => a.display_order - b.display_order)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [looks, categories]);


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
    
    if (!destination || source.droppableId !== destination.droppableId) {
        if (destination) toast.error("Chỉ có thể sắp xếp thứ tự trong cùng một danh mục.");
        return;
    }
    
    const parentCategoryId = source.droppableId;
    const looksInGroup = looks.filter(l => {
        const cat = categories.find(c => c.id === l.category_id);
        return cat && (cat.id === parentCategoryId || cat.parent_id === parentCategoryId);
    }).sort((a, b) => a.display_order - b.display_order);
    
    const newLooks = Array.from(looksInGroup);
    const [reorderedItem] = newLooks.splice(source.index, 1);
    newLooks.splice(destination.index, 0, reorderedItem);

    const updatedOrderMap = new Map(newLooks.map((look, index) => [look.id, index + 1]));

    const updatedLooks = looks.map(l => {
        if (updatedOrderMap.has(l.id)) {
            return { ...l, display_order: updatedOrderMap.get(l.id) };
        }
        return l;
    });
    setLooks(updatedLooks as any[]);

    try {
      const promises = newLooks.map((item, index) => 
        supabase
          .from('shop_looks')
          .update({ display_order: index + 1 })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
      toast.success(`Đã cập nhật vị trí Lookbook trong danh mục.`);
    } catch (error) {
      toast.error("Lỗi khi lưu vị trí");
      fetchLooks();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (looks.length === 0) return <div className="text-center py-12 text-muted-foreground italic">Chưa có Lookbook nào được tạo.</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6">
        {groupedLooks.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-charcoal flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-primary" />
              {group.name} 
              <Badge variant="secondary" className="text-[10px]">{group.looks.length}</Badge>
            </h3>
            
            <Droppable droppableId={group.id}>
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className={cn("space-y-4 p-1 transition-all", snapshot.isDraggingOver && "bg-secondary/50 rounded-xl")}
                >
                  {group.looks.map((look, index) => (
                    <Draggable key={look.id} draggableId={look.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "bg-secondary/30 p-4 rounded-xl border border-border/50 flex items-center gap-4 transition-all",
                            snapshot.isDragging ? "shadow-elevated scale-[1.01] border-primary/40 z-50 bg-white" : "",
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
                              <LinkIcon className="w-3 h-3" /> Thứ tự: {look.display_order}
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
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}