import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VariantConfigSectionProps {
  attributes: any[];
  tierConfig: any[];
  setTierConfig: (config: any[]) => void;
}

export function VariantConfigSection({ attributes, tierConfig, setTierConfig }: VariantConfigSectionProps) {
  const [tempValue, setTempValue] = useState<Record<number, string>>({});

  const addTier = () => {
    if (tierConfig.length >= 3) {
      toast.error("Tối đa 3 cấp phân loại.");
      return;
    }
    setTierConfig([...tierConfig, { name: "", values: [] }]);
  };

  const addValueToTier = (index: number, val?: string) => {
    const valueToAdd = (val || tempValue[index] || "").trim();
    if (!valueToAdd) return;

    const newConfig = [...tierConfig];
    if (!newConfig[index].values.includes(valueToAdd)) {
      newConfig[index].values = [...newConfig[index].values, valueToAdd];
      setTierConfig(newConfig);
    }
    setTempValue({ ...tempValue, [index]: "" });
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Tạo biến thể sản phẩm</h3>
        <Button 
          type="button"
          size="sm" 
          variant="outline" 
          onClick={addTier} 
          className="text-[10px] font-bold uppercase h-8 rounded-lg border-primary/20 text-primary"
        >
          <Plus className="w-3 h-3 mr-1" /> Thêm nhóm phân loại
        </Button>
      </div>

      {tierConfig.map((tier, idx) => {
        const selectedAttr = attributes.find(a => a.name === tier.name);
        const availableOptions = selectedAttr?.options || [];

        return (
          <div key={idx} className="p-6 bg-secondary/30 rounded-2xl border border-border/50 relative animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Badge className="bg-primary text-white border-none h-6 px-3">Nhóm {idx + 1}</Badge>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const n = [...tierConfig]; n.splice(idx, 1); setTierConfig(n);
                }} 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Tên nhóm (VD: Màu sắc)</Label>
                <Select value={tier.name} onValueChange={(val) => {
                  const n = [...tierConfig]; n[idx].name = val; setTierConfig(n);
                }}>
                  <SelectTrigger className="h-11 bg-white rounded-xl"><SelectValue placeholder="Chọn nhóm..." /></SelectTrigger>
                  <SelectContent>{attributes.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Thêm giá trị (VD: Xanh)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập giá trị..." 
                    className="h-11 bg-white rounded-xl"
                    value={tempValue[idx] || ""}
                    onChange={(e) => setTempValue({ ...tempValue, [idx]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToTier(idx))}
                  />
                  <Button type="button" size="icon" variant="secondary" onClick={() => addValueToTier(idx)} className="h-11 w-11 rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            {availableOptions.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Gợi ý từ hệ thống:</p>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.map((opt: string) => {
                    const isSelected = tier.values.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => addValueToTier(idx, opt)}
                        disabled={isSelected}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                          isSelected 
                            ? "bg-primary/10 border-primary/20 text-primary opacity-50 cursor-default" 
                            : "bg-white border-border hover:border-primary/40 text-charcoal"
                        )}
                      >
                        {opt} {isSelected && <Check className="w-2.5 h-2.5 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Giá trị đã chọn:</p>
              <div className="flex flex-wrap gap-2">
                {tier.values.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground italic">Chưa có giá trị nào.</span>
                ) : (
                  tier.values.map((val: string) => (
                    <Badge key={val} variant="outline" className="bg-white gap-2 h-8 px-3 rounded-xl border-primary/20 shadow-sm">
                      <span className="text-[11px] font-bold text-charcoal">{val}</span>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}