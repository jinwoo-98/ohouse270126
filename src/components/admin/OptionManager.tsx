import { useState } from "react";
import { Plus, X, List, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Option {
  label: string;
  value: string;
}

interface OptionManagerProps {
  title: string;
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function OptionManager({ title, options, onChange }: OptionManagerProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newValue.trim()) {
      toast.error("Vui lòng nhập cả Tên hiển thị và Giá trị.");
      return;
    }
    if (options.some(o => o.value === newValue.trim())) {
      toast.error("Giá trị (Value) đã tồn tại.");
      return;
    }

    const newOption: Option = {
      label: newLabel.trim(),
      value: newValue.trim(),
    };

    onChange([...options, newOption]);
    setNewLabel("");
    setNewValue("");
  };

  const handleRemoveOption = (valueToRemove: string) => {
    onChange(options.filter(o => o.value !== valueToRemove));
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <List className="w-3 h-3" /> {title} ({options.length})
      </h4>
      
      <div className="p-4 bg-secondary/20 rounded-xl border border-border/50 space-y-4">
        <form onSubmit={handleAddOption} className="grid grid-cols-3 gap-3">
          <div className="col-span-3 space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tên hiển thị (Label)</Label>
            <Input 
              placeholder="VD: Phòng Khách" 
              value={newLabel} 
              onChange={e => setNewLabel(e.target.value)} 
              className="h-10 rounded-lg"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Giá trị (Value)</Label>
            <Input 
              placeholder="VD: living" 
              value={newValue} 
              onChange={e => setNewValue(e.target.value)} 
              className="h-10 rounded-lg font-mono text-xs"
            />
          </div>
          <div className="col-span-1 flex items-end">
            <Button type="submit" size="icon" className="h-10 w-full rounded-lg"><Plus className="w-4 h-4" /></Button>
          </div>
        </form>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
        {options.length === 0 && <p className="text-xs text-muted-foreground italic">Chưa có tùy chọn nào.</p>}
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center justify-between p-2 bg-white rounded-lg border border-border/50 shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-charcoal">{opt.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{opt.value}</span>
            </div>
            <button 
              type="button"
              onClick={() => handleRemoveOption(opt.value)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}