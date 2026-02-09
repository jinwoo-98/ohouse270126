import { useState } from "react";
import { Plus, X, List, Save, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea

interface Option {
  id: string; // Unique ID for DND
  label: string;
  value: string;
}

interface OptionManagerProps {
  title: string;
  options: Option[];
  onChange: (options: Option[]) => void;
}

// Simple slugification function
const slugify = (text: string) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

export function OptionManager({ title, options, onChange }: OptionManagerProps) {
  const [newInput, setNewInput] = useState(""); // Thay đổi từ newLabel thành newInput

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const input = newInput.trim();
    if (!input) {
      toast.error("Vui lòng nhập Tên hiển thị.");
      return;
    }
    
    // Tách chuỗi bằng dấu phẩy hoặc xuống dòng
    const newLabels = input.split(/[\n,]/)
      .map(label => label.trim())
      .filter(label => label.length > 0);

    if (newLabels.length === 0) return;

    const newOptions: Option[] = [];
    let hasDuplicate = false;

    newLabels.forEach(label => {
      const generatedValue = slugify(label);
      
      // Kiểm tra trùng lặp trong danh sách hiện tại và danh sách mới
      if (options.some(o => o.value === generatedValue) || newOptions.some(o => o.value === generatedValue)) {
        hasDuplicate = true;
        toast.error(`Giá trị "${label}" đã tồn tại hoặc trùng lặp. Bỏ qua.`);
        return;
      }

      newOptions.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Generate unique ID for DND
        label: label,
        value: generatedValue,
      });
    });

    if (newOptions.length > 0) {
      onChange([...options, ...newOptions]);
      setNewInput("");
      toast.success(`Đã thêm ${newOptions.length} tùy chọn.`);
    } else if (!hasDuplicate) {
      toast.info("Không có tùy chọn hợp lệ nào được thêm.");
    }
  };

  const handleRemoveOption = (idToRemove: string) => {
    onChange(options.filter(o => o.id !== idToRemove));
  };
  
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const newOptions = Array.from(options);
    const [reorderedItem] = newOptions.splice(source.index, 1);
    newOptions.splice(destination.index, 0, reorderedItem);

    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <List className="w-3 h-3" /> {title} ({options.length})
      </h4>
      
      <div className="p-4 bg-secondary/20 rounded-xl border border-border/50 space-y-4">
        <form onSubmit={handleAddOption} className="grid grid-cols-4 gap-3">
          <div className="col-span-3 space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tên hiển thị (Mỗi dòng/dấu phẩy là 1 giá trị)</Label>
            <Textarea 
              placeholder="VD: Phòng Khách, Phòng Ngủ, Phòng Bếp" 
              value={newInput} 
              onChange={e => setNewInput(e.target.value)} 
              className="min-h-[80px] rounded-lg resize-none"
            />
          </div>
          <div className="col-span-1 flex items-end">
            <Button type="submit" size="icon" className="h-10 w-full rounded-lg"><Plus className="w-4 h-4" /></Button>
          </div>
        </form>
        <p className="text-[10px] text-muted-foreground italic">Giá trị (Value) sẽ được tự động tạo từ tên hiển thị.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="option-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2"
            >
              {options.length === 0 && <p className="text-xs text-muted-foreground italic p-2">Chưa có tùy chọn nào.</p>}
              {options.map((opt, index) => (
                <Draggable key={opt.id} draggableId={opt.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "flex items-center justify-between p-2 bg-white rounded-lg border border-border/50 shadow-sm transition-all",
                        snapshot.isDragging ? "shadow-md bg-secondary/50" : ""
                      )}
                    >
                      <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-charcoal cursor-grab active:cursor-grabbing px-1 shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-bold text-charcoal truncate">{opt.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">{opt.value}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}