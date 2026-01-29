import { useState } from "react";
import { Box, X, Search, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CrossSellSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  allProducts: any[];
}

export function CrossSellSection({ formData, setFormData, allProducts }: CrossSellSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState<'perfect' | 'bought' | null>(null);

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (type: 'perfect_match_ids' | 'bought_together_ids', id: string) => {
    if (!formData[type].includes(id)) {
      setFormData({ ...formData, [type]: [...formData[type], id] });
    }
    setActiveType(null);
    setSearchTerm("");
  };

  const handleRemove = (type: 'perfect_match_ids' | 'bought_together_ids', id: string) => {
    setFormData({ ...formData, [type]: formData[type].filter((x: string) => x !== id) });
  };

  const renderSelectedList = (type: 'perfect_match_ids' | 'bought_together_ids') => {
    const selectedIds = formData[type] || [];
    if (selectedIds.length === 0) {
      return (
        <div className="py-12 border-2 border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
          <ShoppingBag className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-xs font-medium italic">Chưa chọn sản phẩm nào. Hệ thống sẽ tự động gợi ý.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {selectedIds.map((pid: string) => {
          const p = allProducts.find(x => x.id === pid);
          if (!p) return null;
          return (
            <div key={pid} className="group relative bg-white p-2 rounded-xl border border-border/60 shadow-sm hover:border-primary/40 transition-all flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border/40">
                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-charcoal truncate">{p.name}</p>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">Sản phẩm liên quan</p>
              </div>
              <button 
                type="button" 
                onClick={() => handleRemove(type, pid)} 
                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-charcoal">Gợi ý phối đồ (Perfect Match)</h3>
              <p className="text-[10px] text-muted-foreground font-medium italic">Sản phẩm kết hợp tạo thành bộ sưu tập</p>
            </div>
          </div>
          <Popover open={activeType === 'perfect'} onOpenChange={(open) => setActiveType(open ? 'perfect' : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2">
                <Plus className="w-3.5 h-3.5" /> Chọn sản phẩm
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[400px] rounded-2xl shadow-elevated border-none z-[130]" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center px-3 h-10 bg-secondary/30 rounded-xl">
                  <Search className="w-4 h-4 text-muted-foreground mr-3" />
                  <Input placeholder="Tìm tên sản phẩm..." className="h-full border-none bg-transparent focus-visible:ring-0 text-sm p-0" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <ScrollArea className="h-[300px] p-2">
                <div className="grid gap-1">
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => handleSelect('perfect_match_ids', p.id)} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors group">
                      <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-xs font-bold text-charcoal flex-1 truncate">{p.name}</span>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
        {renderSelectedList('perfect_match_ids')}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-charcoal">Thường mua cùng nhau (Bought Together)</h3>
              <p className="text-[10px] text-muted-foreground font-medium italic">Sản phẩm phụ kiện, bổ sung giá tốt</p>
            </div>
          </div>
          <Popover open={activeType === 'bought'} onOpenChange={(open) => setActiveType(open ? 'bought' : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2">
                <Plus className="w-3.5 h-3.5" /> Chọn sản phẩm
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[400px] rounded-2xl shadow-elevated border-none z-[130]" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center px-3 h-10 bg-secondary/30 rounded-xl">
                  <Search className="w-4 h-4 text-muted-foreground mr-3" />
                  <Input placeholder="Tìm tên sản phẩm..." className="h-full border-none bg-transparent focus-visible:ring-0 text-sm p-0" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <ScrollArea className="h-[300px] p-2">
                <div className="grid gap-1">
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => handleSelect('bought_together_ids', p.id)} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors group">
                      <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-xs font-bold text-charcoal flex-1 truncate">{p.name}</span>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
        {renderSelectedList('bought_together_ids')}
      </div>
    </div>
  );
}