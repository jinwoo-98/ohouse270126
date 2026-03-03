import { Layers, Settings2, Zap, Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumberWithDots, parseNumberFromDots, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingCategorySectionProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  attributes: any[];
  tierConfig: any[];
  setTierConfig: (config: any[]) => void;
  variants: any[];
  setVariants: React.Dispatch<React.SetStateAction<any[]>>;
}

export function PricingCategorySection({ 
  formData, 
  setFormData, 
  categories, 
  attributes,
  tierConfig,
  setTierConfig,
  variants,
  setVariants
}: PricingCategorySectionProps) {
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [tempValue, setTempValue] = useState<Record<number, string>>({});
  
  const parents = categories.filter(c => !c.parent_id);
  const children = categories.filter(c => c.parent_id === selectedParentId);

  useEffect(() => {
    if (formData.category_id) {
      const current = categories.find(c => c.slug === formData.category_id);
      if (current?.parent_id) setSelectedParentId(current.parent_id);
      else if (current) setSelectedParentId(current.id);
    }
  }, [formData.category_id, categories]);

  // Logic sinh biến thể (từ ProductVariantsSection cũ)
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
      const existing = variants.find(v => JSON.stringify(v.tier_values) === JSON.stringify(combo));
      return existing || {
        tier_values: combo,
        price: formData.price || "0",
        original_price: "",
        stock: 10,
        sku: ""
      };
    });

    if (JSON.stringify(newVariants.map(v => v.tier_values)) !== JSON.stringify(variants.map(v => v.tier_values))) {
      setVariants(newVariants);
    }
  }, [tierConfig, formData.price]);

  const addTier = () => {
    if (tierConfig.length >= 3) {
      toast.error("Tối đa 3 cấp phân loại.");
      return;
    }
    setTierConfig([...tierConfig, { name: "", values: [] }]);
  };

  const addValueToTier = async (index: number, val?: string) => {
    const valueToAdd = (val || tempValue[index] || "").trim();
    if (!valueToAdd) return;

    const newConfig = [...tierConfig];
    if (!newConfig[index].values.includes(valueToAdd)) {
      newConfig[index].values = [...newConfig[index].values, valueToAdd];
      setTierConfig(newConfig);
    }
    setTempValue({ ...tempValue, [index]: "" });
  };

  const updateVariantField = (index: number, field: string, value: any) => {
    let finalValue = value;
    if (field === 'price' || field === 'original_price') finalValue = parseNumberFromDots(value);
    setVariants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: finalValue };
      return next;
    });
  };

  const hasVariants = tierConfig.length > 0;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Layers className="w-4 h-4" /> 2. Danh mục & Giá bán
      </h3>

      {/* 2.1 Danh mục */}
      <div className="space-y-4">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phân loại danh mục</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Select value={selectedParentId} onValueChange={setSelectedParentId}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục cha..." /></SelectTrigger>
              <SelectContent>
                {parents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedParentId && children.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Select 
                value={formData.category_id} 
                onValueChange={(val) => setFormData({...formData, category_id: val})}
              >
                <SelectTrigger className="h-11 rounded-xl border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Chọn danh mục con..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={parents.find(p => p.id === selectedParentId)?.slug}>-- Tất cả {parents.find(p => p.id === selectedParentId)?.name} --</SelectItem>
                  {children.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* 2.2 Cấu hình Phân loại */}
      <div className="space-y-6 pt-6 border-t border-dashed">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phân loại sản phẩm (Màu sắc, Kích thước...)</Label>
          <Button 
            type="button"
            size="sm" 
            variant="outline" 
            onClick={addTier} 
            className="text-[10px] font-bold uppercase h-8 rounded-lg border-primary/20 text-primary"
          >
            <Plus className="w-3 h-3 mr-1" /> Thêm phân loại
          </Button>
        </div>

        {tierConfig.map((tier, idx) => (
          <div key={idx} className="p-5 bg-secondary/30 rounded-2xl border border-border/50 relative animate-fade-in">
            <button type="button" onClick={() => {
              const n = [...tierConfig]; n.splice(idx, 1); setTierConfig(n);
            }} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Select value={tier.name} onValueChange={(val) => {
                const n = [...tierConfig]; n[idx].name = val; setTierConfig(n);
              }}>
                <SelectTrigger className="h-10 bg-white rounded-xl"><SelectValue placeholder="Chọn nhóm (Màu, Size...)" /></SelectTrigger>
                <SelectContent>{attributes.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nhập giá trị..." 
                  className="h-10 bg-white rounded-xl"
                  value={tempValue[idx] || ""}
                  onChange={(e) => setTempValue({ ...tempValue, [idx]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToTier(idx))}
                />
                <Button type="button" size="icon" variant="secondary" onClick={() => addValueToTier(idx)} className="h-10 w-10 rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tier.values.map((val: string) => (
                <Badge key={val} variant="outline" className="bg-white gap-2 h-7 px-2 rounded-lg border-primary/20">
                  <span className="text-[11px] font-bold">{val}</span>
                  <button type="button" onClick={() => {
                    const n = [...tierConfig]; n[idx].values = n[idx].values.filter((v: any) => v !== val); setTierConfig(n);
                  }}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2.3 Giá bán */}
      <div className="pt-6 border-t border-dashed">
        {!hasVariants ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá bán lẻ (VND) *</Label>
              <Input 
                type="text" 
                value={formatNumberWithDots(formData.price)} 
                onChange={(e) => setFormData({...formData, price: parseNumberFromDots(e.target.value)})} 
                className="h-12 rounded-xl font-bold text-primary text-lg" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Giá gốc (Gạch bỏ)</Label>
              <Input 
                type="text" 
                value={formatNumberWithDots(formData.original_price)} 
                onChange={(e) => setFormData({...formData, original_price: parseNumberFromDots(e.target.value)})} 
                className="h-12 rounded-xl" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-primary" />
              <p className="text-xs font-medium text-charcoal">Giá hiển thị trên web sẽ lấy từ <b>biến thể đầu tiên</b> trong bảng bên dưới.</p>
            </div>
            <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-muted-foreground font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-4">Phân loại</th>
                      <th className="p-4 w-40 text-primary">Giá bán *</th>
                      <th className="p-4 w-32">Giá gốc</th>
                      <th className="p-4 w-24 text-center">Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(v.tier_values).map(([k, val]: any) => (
                              <Badge key={k} variant="secondary" className="text-[9px] bg-gray-100">{k}: {val}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4"><Input type="text" value={formatNumberWithDots(v.price)} onChange={e => updateVariantField(idx, 'price', e.target.value)} className="h-8 text-xs font-bold text-primary" /></td>
                        <td className="p-4"><Input type="text" value={formatNumberWithDots(v.original_price)} onChange={e => updateVariantField(idx, 'original_price', e.target.value)} className="h-8 text-xs" /></td>
                        <td className="p-4"><Input type="number" value={v.stock} onChange={e => updateVariantField(idx, 'stock', e.target.value)} className="h-8 text-xs text-center" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}