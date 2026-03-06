"use client";

import { useState } from "react";
import { Plus, Trash2, Check, Tag, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  attributes: any[]; // Danh sách từ bảng variant_options
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

  const updateTierName = (index: number, name: string) => {
    const newConfig = [...tierConfig];
    newConfig[index].name = name;
    setTierConfig(newConfig);
  };

  const addValueToTier = (index: number, val?: string) => {
    const labelToAdd = (val || tempValue[index] || "").trim();
    if (!labelToAdd) return;

    const newConfig = [...tierConfig];
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
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Cấu hình phân loại biến thể</h3>
        </div>
        <Button 
          type="button"
          size="sm" 
          variant="outline" 
          onClick={addTier} 
          className="text-[10px] font-bold uppercase h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
        >
          <Plus className="w-3 h-3 mr-1" /> Thêm nhóm phân loại
        </Button>
      </div>

      {tierConfig.length === 0 && (
        <div className="py-10 border-2 border-dashed border-border/60 rounded-2xl text-center bg-secondary/10">
          <p className="text-xs text-muted-foreground italic">Sản phẩm này chưa có phân loại (Màu sắc, Kích thước...).</p>
        </div>
      )}

      {tierConfig.map((tier, idx) => {
        const matchedAttr = attributes.find(a => a.name.toLowerCase() === tier.name.toLowerCase());
        const suggestions = matchedAttr?.options || [];

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
            
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Tên nhóm phân loại</Label>
                <Input 
                  value={tier.name} 
                  onChange={(e) => updateTierName(idx, e.target.value)}
                  placeholder="VD: Màu sắc, Kích thước..."
                  className="h-11 bg-white rounded-xl font-bold"
                />
                
                {/* Gợi ý nhanh tên nhóm */}
                <div className="flex flex-wrap gap-1.5">
                  {attributes.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => updateTierName(idx, a.name)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase border transition-all",
                        tier.name === a.name ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Thêm giá trị</Label>
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

                {/* Gợi ý nhanh giá trị từ nhóm đã chọn */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase mr-1">
                      <Lightbulb className="w-3 h-3" /> Gợi ý:
                    </div>
                    {suggestions.map((s: string) => {
                      const isAdded = tier.values.some(v => v.label === s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addValueToTier(idx, s)}
                          disabled={isAdded}
                          className={cn(
                            "px-2 py-1 rounded-md text-[9px] font-bold transition-all border",
                            isAdded ? "bg-gray-100 text-gray-300 border-transparent" : "bg-white text-charcoal hover:border-primary/40"
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-dashed border-border/40">
              <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Danh sách giá trị & Ảnh minh họa:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tier.values.map((v, vIdx) => (
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
                        {v.image_url ? "Đã có ảnh" : "Chưa có ảnh"}
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
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}