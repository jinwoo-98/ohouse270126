import { useState } from "react";
import { Box, X, Search, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CrossSellSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  allProducts: any[];
}

export function CrossSellSection({ formData, setFormData, allProducts }: CrossSellSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCombobox, setOpenCombobox] = useState<'perfect' | 'bought' | null>(null);

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (type: 'perfect_match_ids' | 'bought_together_ids', id: string) => {
    if (!formData[type].includes(id)) {
      setFormData({ ...formData, [type]: [...formData[type], id] });
    }
    setOpenCombobox(null);
    setSearchTerm("");
  };

  const handleRemove = (type: 'perfect_match_ids' | 'bought_together_ids', id: string) => {
    setFormData({ ...formData, [type]: formData[type].filter((x: string) => x !== id) });
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
        <Box className="w-4 h-4" /> 4. Gợi ý & Phối đồ (Cross-sell)
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Perfect Match - Bộ Sưu Tập */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between">
            <span>Bộ sưu tập (Perfect Match)</span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{formData.perfect_match_ids.length} sản phẩm</span>
          </Label>
          <p className="text-[10px] text-muted-foreground italic">
            Chọn các sản phẩm phối hợp đẹp mắt với sản phẩm này (VD: Sofa + Bàn trà + Đèn cây).
          </p>
          
          <Popover open={openCombobox === 'perfect'} onOpenChange={(open) => setOpenCombobox(open ? 'perfect' : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between h-11 rounded-xl text-muted-foreground hover:text-charcoal border-dashed border-border">
                <span className="flex items-center gap-2 text-xs"><Plus className="w-3.5 h-3.5" /> Thêm sản phẩm vào bộ sưu tập</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <div className="p-2 border-b">
                <div className="flex items-center px-2 py-1 bg-secondary/30 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                  <Input 
                    placeholder="Tìm tên sản phẩm..." 
                    className="h-7 border-none bg-transparent focus-visible:ring-0 text-xs p-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {filteredProducts.map((p) => (
                    <div 
                      key={p.id} 
                      className="px-2 py-2 hover:bg-secondary/50 rounded-md cursor-pointer text-xs flex items-center justify-between group"
                      onClick={() => handleSelect('perfect_match_ids', p.id)}
                    >
                      <span className="line-clamp-1">{p.name}</span>
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary" />
                    </div>
                  ))}
                  {filteredProducts.length === 0 && <p className="text-xs text-center py-4 text-muted-foreground">Không tìm thấy.</p>}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <div className="flex flex-col gap-2 bg-secondary/10 p-3 rounded-xl min-h-[80px]">
            {formData.perfect_match_ids.length === 0 && <span className="text-xs text-muted-foreground/50 text-center py-4">Chưa chọn sản phẩm nào.</span>}
            {formData.perfect_match_ids.map((pid: string) => {
              const p = allProducts.find(x => x.id === pid);
              return p ? (
                <div key={pid} className="flex items-center justify-between bg-white p-2 rounded-lg border border-border shadow-sm text-xs">
                  <span className="font-medium truncate flex-1">{p.name}</span>
                  <button type="button" onClick={() => handleRemove('perfect_match_ids', pid)} className="text-muted-foreground hover:text-destructive p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Bought Together - Mua Cùng */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between">
            <span>Thường mua cùng (Bought Together)</span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{formData.bought_together_ids.length} sản phẩm</span>
          </Label>
          <p className="text-[10px] text-muted-foreground italic">
            Gợi ý các phụ kiện hoặc sản phẩm bổ trợ giá thấp hơn (VD: Gối, Thảm, Lọ hoa).
          </p>

          <Popover open={openCombobox === 'bought'} onOpenChange={(open) => setOpenCombobox(open ? 'bought' : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between h-11 rounded-xl text-muted-foreground hover:text-charcoal border-dashed border-border">
                <span className="flex items-center gap-2 text-xs"><Plus className="w-3.5 h-3.5" /> Thêm sản phẩm mua cùng</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <div className="p-2 border-b">
                <div className="flex items-center px-2 py-1 bg-secondary/30 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                  <Input 
                    placeholder="Tìm tên sản phẩm..." 
                    className="h-7 border-none bg-transparent focus-visible:ring-0 text-xs p-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {filteredProducts.map((p) => (
                    <div 
                      key={p.id} 
                      className="px-2 py-2 hover:bg-secondary/50 rounded-md cursor-pointer text-xs flex items-center justify-between group"
                      onClick={() => handleSelect('bought_together_ids', p.id)}
                    >
                      <span className="line-clamp-1">{p.name}</span>
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <div className="flex flex-col gap-2 bg-secondary/10 p-3 rounded-xl min-h-[80px]">
            {formData.bought_together_ids.length === 0 && <span className="text-xs text-muted-foreground/50 text-center py-4">Chưa chọn sản phẩm nào.</span>}
            {formData.bought_together_ids.map((pid: string) => {
              const p = allProducts.find(x => x.id === pid);
              return p ? (
                <div key={pid} className="flex items-center justify-between bg-white p-2 rounded-lg border border-border shadow-sm text-xs">
                  <span className="font-medium truncate flex-1">{p.name}</span>
                  <button type="button" onClick={() => handleRemove('bought_together_ids', pid)} className="text-muted-foreground hover:text-destructive p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}