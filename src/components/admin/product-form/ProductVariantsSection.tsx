import { useState, useEffect, useMemo } from "react";
import { Layers, Plus, Trash2, X, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductVariantsSectionProps {
  attributes: any[];
  tierConfig: any[];
  setTierConfig: (config: any[]) => void;
  variants: any[];
  setVariants: React.Dispatch<React.SetStateAction<any[]>>;
  basePrice: string;
}

export function ProductVariantsSection({ 
  attributes, 
  tierConfig, 
  setTierConfig, 
  variants, 
  setVariants,
  basePrice
}: ProductVariantsSectionProps) {
  const [tempValue, setTempValue] = useState<Record<number, string>>({});

  // Sinh tổ hợp biến thể khi cấu hình thay đổi
  useEffect(() => {
    const validTiers = tierConfig.filter(t => t.name && t.values.length > 0);
    
    if (validTiers.length === 0) {
      if (variants.length > 0) setVariants([]);
      return;
    }

    const generateCombinations = (tiers: any[], index = 0, current: any = {}): any[] => {
      if (index === tiers.length) return [current];
      const tier = tiers[index];
      let res: any[] = [];
      tier.values.forEach((val: string) => {
        res = res.concat(generateCombinations(tiers, index + 1, { ...current, [tier.name]: val }));
      });
      return res;
    };

    const combinations = generateCombinations(validTiers);

    const newVariants = combinations.map(combo => {
      // Tìm biến thể cũ để giữ lại giá/kho đã nhập
      const existing = variants.find(v => 
        JSON.stringify(v.tier_values) === JSON.stringify(combo)
      );
      
      return existing || {
        tier_values: combo,
        price: basePrice || "0",
        original_price: "",
        stock: 10,
        sku: ""
      };
    });

    // So sánh để tránh loop render
    if (JSON.stringify(newVariants.map(v => v.tier_values)) !== JSON.stringify(variants.map(v => v.tier_values))) {
      setVariants(newVariants);
    }
  }, [tierConfig, basePrice]);

  const addTier = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn form submit
    if (tierConfig.length >= 3) {
      toast.error("Tối đa 3 cấp phân loại.");
      return;
    }
    setTierConfig([...tierConfig, { name: "", values: [] }]);
  };

  const removeTier = (index: number) => {
    const newConfig = [...tierConfig];
    newConfig.splice(index, 1);
    setTierConfig(newConfig);
  };

  const addValueToTier = (index: number, val?: string) => {
    const valueToAdd = val || tempValue[index];
    if (!valueToAdd || !valueToAdd.trim()) return;
    
    const newConfig = [...tierConfig];
    const currentValues = newConfig[index].values;
    
    if (!currentValues.includes(valueToAdd.trim())) {
      newConfig[index].values = [...currentValues, valueToAdd.trim()];
      setTierConfig(newConfig);
    }
    
    if (!val) {
      setTempValue({ ...tempValue, [index]: "" });
    }
  };

  const updateVariantField = (index: number, field: string, value: any) => {
    setVariants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const applyBasePriceToAll = () => {
    if (!basePrice) {
      toast.error("Vui lòng nhập giá ở phần Thông tin cơ bản trước.");
      return;
    }
    setVariants(prev => prev.map(v => ({ ...v, price: basePrice })));
    toast.success("Đã đồng bộ giá cho tất cả biến thể.");
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Layers className="w-4 h-4" /> 2. Cấu hình phân loại & Giá
        </h3>
        <Button 
          type="button"
          size="sm" 
          variant="outline" 
          onClick={addTier} 
          disabled={tierConfig.length >= 3} 
          className="text-[10px] font-bold uppercase h-9 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
        >
          <Plus className="w-3 h-3 mr-1.5" /> Thêm cấp phân loại
        </Button>
      </div>

      <div className="space-y-6">
        {tierConfig.map((tier, idx) => {
          // Tìm thuộc tính tương ứng để lấy gợi ý giá trị
          const matchedAttr = attributes.find(a => a.name === tier.name);
          const suggestions = matchedAttr?.options || [];

          return (
            <div key={idx} className="p-6 bg-secondary/30 rounded-2xl border border-border/50 relative animate-fade-in">
              <button 
                type="button"
                onClick={() => removeTier(idx)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tên nhóm phân loại {idx + 1}</Label>
                  <Select value={tier.name} onValueChange={(val) => {
                    const newC = [...tierConfig]; 
                    newC[idx] = { ...newC[idx], name: val };
                    setTierConfig(newC);
                  }}>
                    <SelectTrigger className="h-11 bg-white rounded-xl border-border shadow-sm">
                      <SelectValue placeholder="Chọn thuộc tính (Màu, Size...)" />
                    </SelectTrigger>
                    <SelectContent>
                      {attributes.map(attr => (
                        <SelectItem key={attr.id} value={attr.name}>{attr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Thêm giá trị tùy chỉnh</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nhập giá trị mới..." 
                      className="h-11 bg-white rounded-xl shadow-sm"
                      value={tempValue[idx] || ""}
                      onChange={(e) => setTempValue({ ...tempValue, [idx]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToTier(idx))}
                    />
                    <Button type="button" size="icon" variant="secondary" onClick={() => addValueToTier(idx)} className="h-11 w-11 rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              
              {/* Gợi ý giá trị từ hệ thống */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Gợi ý từ hệ thống:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s: string) => {
                      const isAdded = tier.values.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isAdded}
                          onClick={() => addValueToTier(idx, s)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-medium border transition-all",
                            isAdded 
                              ? "bg-gray-100 text-gray-400 border-transparent" 
                              : "bg-white text-charcoal border-border hover:border-primary hover:text-primary"
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Danh sách giá trị đã chọn */}
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Giá trị đã chọn:</Label>
                <div className="flex flex-wrap gap-2">
                  {tier.values.length === 0 && <span className="text-xs text-muted-foreground italic">Chưa có giá trị nào.</span>}
                  {tier.values.map((val: string) => (
                    <Badge key={val} variant="outline" className="bg-white gap-2 h-8 px-3 rounded-lg border-primary/20 shadow-sm">
                      <span className="font-bold text-charcoal">{val}</span>
                      <button type="button" onClick={() => {
                        const n = [...tierConfig]; 
                        n[idx].values = n[idx].values.filter((v: any) => v !== val); 
                        setTierConfig(n);
                      }} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bảng giá tổ hợp */}
      {variants.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-dashed border-border/60 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                Bảng giá tổ hợp ({variants.length})
                <Badge variant="secondary" className="bg-primary/5 text-primary">Tự động sinh</Badge>
              </Label>
              <p className="text-[10px] text-muted-foreground italic mt-1">Hệ thống tự động tạo ra {variants.length} tổ hợp từ các cấp phân loại trên.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={applyBasePriceToAll} className="text-[10px] font-bold text-primary hover:bg-primary/5 uppercase gap-1.5 h-9 rounded-xl border-primary/30">
              <Zap className="w-3.5 h-3.5" /> Đồng bộ giá cơ bản
            </Button>
          </div>
          
          <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-muted-foreground font-bold uppercase tracking-wider border-b">
                  <tr>
                    <th className="p-4">Phân loại cụ thể</th>
                    <th className="p-4 w-40 text-primary">Giá bán lẻ (VND) *</th>
                    <th className="p-4 w-32">Giá gốc</th>
                    <th className="p-4 w-24 text-center">Tồn kho</th>
                    <th className="p-4 w-36">Mã SKU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {variants.map((variant, idx) => (
                    <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(variant.tier_values).map(([k, v]: any) => (
                            <Badge key={k} variant="secondary" className="text-[9px] font-medium bg-gray-100/80 border border-border/50">
                              {k}: <b className="ml-1 text-charcoal">{v}</b>
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Input 
                          type="number" 
                          value={variant.price} 
                          onChange={e => updateVariantField(idx, 'price', e.target.value)} 
                          className="h-9 text-xs font-bold text-primary border-primary/20 focus:ring-1 bg-white" 
                        />
                      </td>
                      <td className="p-4">
                        <Input 
                          type="number" 
                          value={variant.original_price} 
                          onChange={e => updateVariantField(idx, 'original_price', e.target.value)} 
                          className="h-9 text-xs bg-white" 
                          placeholder="Gạch bỏ" 
                        />
                      </td>
                      <td className="p-4">
                        <Input 
                          type="number" 
                          value={variant.stock} 
                          onChange={e => updateVariantField(idx, 'stock', e.target.value)} 
                          className="h-9 text-xs text-center bg-white" 
                        />
                      </td>
                      <td className="p-4">
                        <Input 
                          value={variant.sku || ""} 
                          onChange={e => updateVariantField(idx, 'sku', e.target.value)} 
                          className="h-9 text-xs font-mono bg-white" 
                          placeholder="SKU-XXXX" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}