import { useState } from "react";
import { Plus, Trash2, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface VariantValue {
  label: string;
  image_url?: string;
}

interface VariantTier {
  name: string;
  values: VariantValue[];
}

interface VariantConfigSectionProps {
  attributes: any[];
  tierConfig: VariantTier[];
  setTierConfig: (config: VariantTier[]) => void;
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
    const labelToAdd = (val || tempValue[index] || "").trim();
    if (!labelToAdd) return;

    const newConfig = [...tierConfig];
    // Kiểm tra trùng lặp dựa trên label
    if (!newConfig[index].values.some(v => v.label === labelToAdd)) {
      newConfig[index].values = [...newConfig[index].values, { label: labelToAdd, image_url: "" }];
      setTierConfig(newConfig);
    }
    setTempValue({ ...tempValue, [index]: "" });
  };

  const updateValueImage = (tierIdx: number, valIdx: number, url: string) => {
    const newConfig = [...tierConfig];
    newConfig[tierIdx].values[valIdx].image_url = url;
    setTierConfig(newConfig);
  };

  const removeValue = (tierIdx: number, valIdx: number) => {
    const newConfig = [...tierConfig];
    newConfig[tierIdx].values.splice(valIdx, 1);
    setTierConfig(newConfig);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Cấu hình phân loại biến thể</h3>
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

            {/* Gợi ý từ hệ thống */}
            {availableOptions.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Gợi ý từ hệ thống:</p>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.map((opt: string) => {
                    const isSelected = tier.values.some(v => v.label === opt);
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

            {/* Danh sách giá trị đã chọn với chức năng tải ảnh */}
            <div className="space-y-4">
              <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Quản lý giá trị & Hình ảnh minh họa:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tier.values.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground italic col-span-full">Chưa có giá trị nào.</span>
                ) : (
                  tier.values.map((v, vIdx) => (
                    <div key={vIdx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border/60 shadow-sm group">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 shrink-0 border border-dashed border-border/60 relative">
                        <ImageUpload 
                          value={v.image_url || ""} 
                          onChange={(url) => updateValueImage(idx, vIdx, url as string)}
                          aspectRatio="aspect-square"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-charcoal truncate">{v.label}</p>
                        <p className="text-[9px] text-muted-foreground italic mt-0.5">
                          {v.image_url ? "Đã có ảnh minh họa" : "Chưa có ảnh"}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeValue(idx, vIdx)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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