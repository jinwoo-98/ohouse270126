import { Box, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CrossSellSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  allProducts: any[];
}

export function CrossSellSection({ formData, setFormData, allProducts }: CrossSellSectionProps) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Box className="w-4 h-4" /> 2. Cross-sell & Up-sell (Thủ công)
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Gợi ý phối cảnh (Perfect Match)</Label>
          <Select 
            onValueChange={(val) => {
              if (!formData.perfect_match_ids.includes(val)) {
                setFormData({...formData, perfect_match_ids: [...formData.perfect_match_ids, val]})
              }
            }}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Chọn sản phẩm để phối..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {allProducts.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.perfect_match_ids.map((pid: string) => {
              const p = allProducts.find(x => x.id === pid);
              return p ? (
                <Badge key={pid} variant="secondary" className="gap-2 pl-3">
                  {p.name}
                  <button type="button" onClick={() => setFormData({...formData, perfect_match_ids: formData.perfect_match_ids.filter((x: string) => x !== pid)})} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Thường được mua cùng (Bought Together)</Label>
          <Select 
            onValueChange={(val) => {
              if (!formData.bought_together_ids.includes(val)) {
                setFormData({...formData, bought_together_ids: [...formData.bought_together_ids, val]})
              }
            }}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Chọn sản phẩm mua cùng..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {allProducts.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.bought_together_ids.map((pid: string) => {
              const p = allProducts.find(x => x.id === pid);
              return p ? (
                <Badge key={pid} variant="secondary" className="gap-2 pl-3">
                  {p.name}
                  <button type="button" onClick={() => setFormData({...formData, bought_together_ids: formData.bought_together_ids.filter((x: string) => x !== pid)})} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}