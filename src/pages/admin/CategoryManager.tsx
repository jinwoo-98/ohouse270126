import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Layers,
  GripVertical,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("main");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
      
      // Mặc định mở rộng tất cả danh mục cha có con
      const parentsWithChildren = data?.filter(c => !c.parent_id && data.some(child => child.parent_id === c.id)).map(p => p.id);
      setExpandedRows(new Set(parentsWithChildren));
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    // Lấy danh sách các item cùng cấp độ đang được kéo
    const itemsAtThisLevel = categories.filter(c => {
      if (type === 'PARENT') {
        return !c.parent_id && c.menu_location === activeTab;
      } else {
        return c.parent_id === type; // type chứa ID của parent
      }
    });

    const newItems = Array.from(itemsAtThisLevel);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    // Cập nhật state local
    const updatedCategories = categories.map(c => {
      const foundInNew = newItems.find(n => n.id === c.id);
      if (foundInNew) {
        return { ...c, display_order: newItems.indexOf(foundInNew) + 1 };
      }
      return c;
    });
    setCategories(updatedCategories);

    // Lưu vào DB
    try {
      for (let i = 0; i < newItems.length; i++) {
        await supabase
          .from('categories')
          .update({ display_order: i + 1 })
          .eq('id', newItems[i].id);
      }
      toast.success("Đã cập nhật vị trí");
    } catch (error) {
      toast.error("Lỗi khi lưu vị trí");
      fetchCategories();
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('categories').update({ is_visible: !current }).eq('id', id);
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, is_visible: !current } : c));
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này? Các danh mục con cũng sẽ bị xóa.")) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter(c => c.id !== id && c.parent_id !== id));
    toast.success("Đã xóa");
  };

  const renderList = (parentId: string | null, location: string) => {
    const list = categories.filter(c => c.parent_id === parentId && c.menu_location === location);
    const type = parentId || 'PARENT';

    return (
      <Droppable droppableId={type} type={type}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {list.map((item, index) => {
              const hasChildren = categories.some(c => c.parent_id === item.id);
              const isExpanded = expandedRows.has(item.id);

              return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "bg-card rounded-2xl border border-border/50 transition-all",
                        snapshot.isDragging ? "shadow-elevated scale-[1.01] border-primary/40 z-50" : "shadow-subtle",
                        !parentId && "border-l-4 border-l-primary/20"
                      )}
                    >
                      {/* Row Content */}
                      <div className="flex items-center p-3 md:p-4 gap-4">
                        <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing px-1">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Toggle Expand Button (Only for parents) */}
                        {!parentId && (
                          <button 
                            onClick={() => toggleExpand(item.id)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              hasChildren ? "hover:bg-secondary text-primary" : "text-muted-foreground/20 cursor-default"
                            )}
                          >
                            {hasChildren ? (
                              isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
                            ) : <div className="w-1.5 h-1.5 rounded-full bg-border" />}
                          </button>
                        )}

                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                          {hasChildren ? <FolderOpen className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={cn("font-bold truncate", parentId ? "text-sm text-charcoal/80" : "text-base text-charcoal")}>
                              {item.name}
                            </span>
                            {item.is_highlight && <Badge className="bg-red-500 text-[8px] h-4 px-1.5 uppercase tracking-wider">Sale</Badge>}
                            <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">#{item.display_order}</span>
                          </div>
                          <code className="text-[10px] text-muted-foreground block mt-0.5">/{item.slug}</code>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                          <button 
                            onClick={() => toggleVisibility(item.id, item.is_visible)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all",
                              item.is_visible ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-transparent"
                            )}
                          >
                            {item.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span className="hidden sm:inline">{item.is_visible ? "Hiện" : "Ẩn"}</span>
                          </button>

                          <div className="flex gap-1 border-l border-border/50 pl-2 md:pl-4">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" asChild>
                              <Link to={`/admin/categories/edit/${item.id}`}><Edit className="w-4 h-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Sub-items Container */}
                      {!parentId && isExpanded && (
                        <div className="bg-secondary/20 border-t border-dashed border-border/60 p-4 pl-12 md:pl-16 pb-6 rounded-b-2xl">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <ChevronDown className="w-3 h-3" /> Danh mục con ({categories.filter(c => c.parent_id === item.id).length})
                            </span>
                          </div>
                          {renderList(item.id, location)}
                          
                          {/* Empty State for Sub-items */}
                          {!hasChildren && (
                            <div className="py-8 text-center border-2 border-dashed border-border/40 rounded-xl">
                              <p className="text-xs text-muted-foreground italic">Chưa có danh mục con. Nhấn "Thêm menu mới" và chọn "{item.name}" làm cha.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Layers className="w-7 h-7 text-primary" />
            Cấu Hình Hệ Thống Danh Mục
          </h1>
          <p className="text-muted-foreground text-sm">Sắp xếp vị trí menu bằng cách kéo thả <GripVertical className="inline w-3 h-3 text-muted-foreground/40"/>.</p>
        </div>
        <Button asChild className="btn-hero shadow-gold px-8 h-12">
          <Link to="/admin/categories/new"><Plus className="w-4 h-4 mr-2" /> Thêm menu mới</Link>
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1.5 h-14 rounded-2xl shadow-sm inline-flex">
            <TabsTrigger value="main" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest transition-all">
              Hàng 4 (Menu Sản Phẩm Chính)
            </TabsTrigger>
            <TabsTrigger value="secondary" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest transition-all">
              Hàng 3 (Dịch Vụ & Tin Tức)
            </TabsTrigger>
          </TabsList>

          <div className="animate-fade-in">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Đang tải cấu trúc danh mục...</p>
              </div>
            ) : (
              <>
                <TabsContent value="main" className="mt-0 outline-none">
                  {renderList(null, 'main')}
                </TabsContent>
                <TabsContent value="secondary" className="mt-0 outline-none">
                  {renderList(null, 'secondary')}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </DragDropContext>
    </div>
  );
}