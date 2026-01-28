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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("main");

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
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    // Xác định danh sách đang được kéo (Cha hoặc Con của 1 cha cụ thể)
    const itemsAtThisLevel = categories.filter(c => {
      if (type === 'PARENT') {
        return !c.parent_id && c.menu_location === activeTab;
      } else {
        return c.parent_id === type; // type ở đây chứa parent_id nếu là con
      }
    });

    const newItems = Array.from(itemsAtThisLevel);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    // Cập nhật state local ngay lập tức
    const updatedCategories = categories.map(c => {
      const foundInNew = newItems.find(n => n.id === c.id);
      if (foundInNew) {
        return { ...c, display_order: newItems.indexOf(foundInNew) + 1 };
      }
      return c;
    });
    setCategories(updatedCategories);

    // Cập nhật Database hàng loạt
    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      toast.success("Đã cập nhật thứ tự hiển thị");
    } catch (error) {
      toast.error("Lỗi khi lưu thứ tự mới");
      fetchCategories(); // Rollback
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('categories').update({ is_visible: !current }).eq('id', id);
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, is_visible: !current } : c));
      toast.success("Đã cập nhật trạng thái");
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này?")) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Đã xóa");
  };

  const renderDraggableList = (parentId: string | null, location: string) => {
    const list = categories.filter(c => c.parent_id === parentId && c.menu_location === location);
    const type = parentId || 'PARENT';

    return (
      <Droppable droppableId={type} type={type}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {list.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`bg-white rounded-xl border border-border overflow-hidden transition-all ${
                      snapshot.isDragging ? "shadow-elevated scale-[1.02] border-primary/50" : "shadow-subtle"
                    }`}
                  >
                    <div className="flex items-center p-3 gap-4">
                      <div {...provided.dragHandleProps} className="text-muted-foreground/40 hover:text-primary cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                        {parentId ? <Badge variant="outline" className="px-1 h-4 text-[8px]">{index + 1}</Badge> : <Layers className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold truncate ${parentId ? 'text-charcoal/70' : 'text-charcoal'}`}>
                            {item.name}
                          </span>
                          {item.is_highlight && <Badge className="bg-red-500 text-[8px] h-4 px-1 uppercase">Sale</Badge>}
                        </div>
                        <code className="text-[10px] text-muted-foreground">/{item.slug}</code>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleVisibility(item.id, item.is_visible)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.is_visible ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {item.is_visible ? "Hiện" : "Ẩn"}
                        </button>

                        <div className="flex gap-1 border-l pl-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" asChild>
                            <Link to={`/admin/categories/edit/${item.id}`}><Edit className="w-4 h-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Render Children inside Parent Card if not a sub-item itself */}
                    {!parentId && categories.some(c => c.parent_id === item.id) && (
                      <div className="bg-gray-50/50 border-t border-dashed p-3 pl-12">
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          <ChevronDown className="w-3 h-3" /> Danh mục con
                        </div>
                        {renderDraggableList(item.id, location)}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cấu Hình Vị Trí Danh Mục</h1>
          <p className="text-muted-foreground text-sm">Dùng chuột kéo biểu tượng <GripVertical className="inline w-3 h-3"/> để thay đổi thứ tự hiển thị.</p>
        </div>
        <Button asChild className="btn-hero shadow-gold px-6">
          <Link to="/admin/categories/new"><Plus className="w-4 h-4 mr-2" /> Thêm menu mới</Link>
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1 h-12 rounded-xl">
            <TabsTrigger value="main" className="px-8 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest">
              Hàng 4 (Danh mục Sản phẩm)
            </TabsTrigger>
            <TabsTrigger value="secondary" className="px-8 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest">
              Hàng 3 (Dịch vụ & Hỗ trợ)
            </TabsTrigger>
          </TabsList>

          <div className="max-w-4xl">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : (
              <>
                <TabsContent value="main" className="mt-0 outline-none">
                  {renderDraggableList(null, 'main')}
                </TabsContent>
                <TabsContent value="secondary" className="mt-0 outline-none">
                  {renderDraggableList(null, 'secondary')}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </DragDropContext>
    </div>
  );
}