import { useState, useEffect } from "react";
import { Layers, Plus, Trash2, X } from "lucide-react";
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

interface ProductVariantsSectionProps {
  attributes: any[]; // Danh sách thuộc tính hệ thống
  tierConfig: any[]; // Cấu hình các cấp (Tên nhóm, giá trị)
  setTierConfig: (config: any[]) => void;
  variants: any[]; // Danh sách các dòng biến thể (giá, kho...)
  setVariants: (variants: any[]) => void;
  basePrice: string; // Giá gốc để gợi ý
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

  // Hàm tạo tổ hợp biến thể (Cartesian Product)
  useEffect(() => {
    // Chỉ chạy logic tạo tổ hợp nếu có ít nhất 1 tier có giá trị
    if (tierConfig.length === 0) {
      if (variants.length > 0) setVariants([]);
      return;
    }

    // Logic sinh tổ hợp
    const validTiers = tierConfig.filter(t => t.values.length > 0);
    if (validTiers.length === 0) return;

    // Helper đệ quy để tạo tổ hợp
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

    // Merge với variants hiện tại để giữ lại giá/kho đã nhập
    const newVariants = combinations.map(combo => {
      const existing = variants.find(v => 
        JSON.stringify(v.tier_values) === JSON.stringify(combo)
      );
      
      return existing || {
        tier_values: combo,
        price: basePrice || 0,
        original_price: "",
        stock: 10,
        sku: ""
      };
    });

    // Chỉ update nếu số lượng thay đổi hoặc cấu trúc thay đổi
    // (Để tránh loop, ta so sánh độ dài hoặc kiểm tra sâu hơn, ở đây demo đơn giản)
    if (JSON.stringify(newVariants.map(v => v.tier_values)) !== JSON.stringify(variants.map(v => v.tier_values))) {
      setVariants(newVariants);
    }
  }, [tierConfig]);

  const addTier = () => {
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

  const updateTierName = (index: number, name: string) => {
    const newConfig = [...tierConfig];
    newConfig[index].name = name;
    setTierConfig(newConfig);
  };

  const addValueToTier = (index: number) => {
    const val = tempValue[index];
    if (!val || !val.trim()) return;
    
    const newConfig = [...tierConfig];
    if (!newConfig[index].values.includes(val.trim())) {
      newConfig[index].values.push(val.trim());
      setTierConfig(newConfig);
    }
    setTempValue({ ...tempValue, [index]: "" });
  };

  const removeValueFromTier = (tierIndex: number, valToRemove: string) => {
    const newConfig = [...tierConfig];
    newConfig[tierIndex].values = newConfig[tierIndex].values.filter((v: string) => v !== valToRemove);
    setTierConfig(newConfig);
  };

  const updateVariantField = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const applyBasePriceToAll = () => {
    if (!basePrice) return;
    const newVariants = variants.map(v => ({ ...v, price: basePrice }));
    setVariants(newVariants);
    toast.success("Đã áp dụng giá chung cho tất cả phân loại");
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Layers className="w-4 h-4" /> 4. Phân loại hàng (Biến thể)
        </h3>
        <Button size="sm" variant="outline" onClick={addTier} disabled={tierConfig.length >= 3} className="text-xs h-9">
          <Plus className="w-3 h-3 mr-1" /> Thêm nhóm phân loại
        </Button>
      </div>

      {/* Cấu hình nhóm phân loại */}
      <div className="space-y-4">
        {tierConfig.map((tier, idx) => (
          <div key={idx} className="p-4 bg-secondary/20 rounded-xl border border-border/50">
            <div className="flex gap-4 mb-3">
              <div className="w-1/3 space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tên nhóm {idx + 1}</Label>
                <Select 
                  value={tier.name} 
                  onValueChange={(val) => updateTierName(idx, val)}
                >
                  <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Chọn thuộc tính (VD: Màu sắc)" /></SelectTrigger>
                  <SelectContent>
                    {attributes.map(attr => (
                      <SelectItem key={attr.id} value={attr.name}>{attr.name}</SelectItem>
                    ))}
                    {/* Fallback custom input logic could be added here if needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Giá trị phân loại</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập giá trị và ấn Enter (VD: Đỏ, Xanh...)" 
                    className="h-10 bg-white"
                    value={tempValue[idx] || ""}
                    onChange={(e) => setTempValue({ ...tempValue, [idx]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToTier(idx))}
                  />
                  <Button size="icon" variant="secondary" onClick={() => addValueToTier(idx)} className="shrink-0 h-10 w-10"><Plus className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => removeTier(idx)} className="shrink-0 h-10 w-10 text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tier.values.map((val: string) => (
                <Badge key={val} variant="outline" className="bg-white gap-2 h-7 px-3">
                  {val}
                  <button onClick={() => removeValueFromTier(idx, val)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bảng thiết lập giá chi tiết */}
      {variants.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-dashed">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Danh sách phân loại ({variants.length})</Label>
            <Button variant="link" size="sm" onClick={applyBasePriceToAll} className="text-[10px] text-primary h-auto p-0">Áp dụng giá chung cho tất cả</Button>
          </div>
          
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/30 text-muted-foreground font-bold uppercase">
                <tr>
                  <th className="p-3 pl-4">Phân loại</th>
                  <th className="p-3 w-32">Giá bán *</th>
                  <th className="p-3 w-32">Giá gốc</th>
                  <th className="p-3 w-24">Kho</th>
                  <th className="p-3 w-32">Mã SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant, idx) => (
                  <tr key={idx} className="bg-white hover:bg-secondary/10">
                    <td className="p-3 pl-4">
                      <div className="flex gap-2">
                        {Object.entries(variant.tier_values).map(([key, val]: any) => (
                          <Badge key={key} variant="secondary" className="text-[10px] font-normal">{key}: <b>{val}</b></Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        value={variant.price} 
                        onChange={(e) => updateVariantField(idx, 'price', e.target.value)} 
                        className="h-8 text-xs font-bold"
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        value={variant.original_price} 
                        onChange={(e) => updateVariantField(idx, 'original_price', e.target.value)} 
                        className="h-8 text-xs"
                        placeholder="Trống"
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        value={variant.stock} 
                        onChange={(e) => updateVariantField(idx, 'stock', e.target.value)} 
                        className="h-8 text-xs text-center"
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        value={variant.sku || ""} 
                        onChange={(e) => updateVariantField(idx, 'sku', e.target.value)} 
                        className="h-8 text-xs font-mono"
                        placeholder="SKU..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}