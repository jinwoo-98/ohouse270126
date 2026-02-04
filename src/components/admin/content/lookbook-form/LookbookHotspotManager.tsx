import { useState, useMemo } from "react";
import { Plus, X, Search, Label as LabelIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // <-- FIX: Import Label component from shadcn/ui
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LookItem {
  product_id: string;
  product_name: string;
  x_position: number;
  y_position: number;
  target_image_url: string;
}

interface LookbookHotspotManagerProps {
  products: any[];
  lookItems: LookItem[];
  setLookItems: React.Dispatch<React.SetStateAction<LookItem[]>>;
  activeEditingImage: string | null;
  allEditingImages: string[];
  setActiveEditingImage: (url: string) => void;
}

export function LookbookHotspotManager({ 
  products, 
  lookItems, 
  setLookItems, 
  activeEditingImage, 
  allEditingImages,
  setActiveEditingImage
}: LookbookHotspotManagerProps) {
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const lookItemsForActiveImage = useMemo(() => 
    lookItems.filter(i => i.target_image_url === activeEditingImage),
    [lookItems, activeEditingImage]
  );

  const handleAddLookItem = (product: any) => {
    if (!activeEditingImage) {
      toast.error("Vui lòng chọn ảnh để gắn Hotspot trước.");
      return;
    }
    if (!lookItems.find(i => i.product_id === product.id && i.target_image_url === activeEditingImage)) {
      setLookItems([...lookItems, { product_id: product.id, product_name: product.name, x_position: 50, y_position: 50, target_image_url: activeEditingImage }]);
    }
  };

  const handleRemoveLookItem = (productId: string, targetImage: string) => {
    setLookItems(lookItems.filter(i => !(i.product_id === productId && i.target_image_url === targetImage)));
  };

  const handleUpdateLookItemPosition = (productId: string, targetImage: string, field: 'x_position' | 'y_position', value: number) => {
    setLookItems(prev => prev.map(item => {
      if (item.product_id === productId && item.target_image_url === targetImage) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Hotspot Preview */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ảnh & Hotspot</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allEditingImages.map(img => (
            <button 
              key={img} 
              type="button" 
              onClick={() => setActiveEditingImage(img)} 
              className={cn("w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0", activeEditingImage === img ? "border-primary" : "border-transparent")}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        
        <div className="bg-gray-100 rounded-2xl relative aspect-square overflow-hidden border border-border/50 shadow-inner">
          {activeEditingImage ? (
            <>
              <img src={activeEditingImage} className="w-full h-full object-cover" />
              {lookItemsForActiveImage.map((item) => {
                const productInfo = products.find(p => p.id === item.product_id);
                return (
                  <div 
                    key={item.product_id} 
                    className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-xs transform -translate-x-1/2 -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" 
                    style={{left:`${item.x_position}%`, top:`${item.y_position}%`}}
                    title={productInfo?.name || item.product_name}
                  >
                    +
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Chọn ảnh để gắn hotspot</div>
          )}
        </div>
      </div>

      {/* Product Selector & Position Manager */}
      <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><LabelIcon className="w-4 h-4" /> Gắn thẻ sản phẩm</h3>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input 
            placeholder="Tìm sản phẩm để gắn..." 
            className="h-9 pl-9 text-xs rounded-xl" 
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar border p-2 rounded-xl bg-secondary/20">
          {filteredProducts.slice(0, 10).map(p => (
            <div 
              key={p.id} 
              className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs"
              onClick={() => handleAddLookItem(p)}
            >
              <span className="truncate">{p.name}</span>
              <Plus className="w-3 h-3 text-primary" />
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed border-border/50">
          <Label className="text-xs font-bold uppercase text-muted-foreground">Vị trí Hotspot ({lookItemsForActiveImage.length})</Label>
          <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
            {lookItemsForActiveImage.map((item) => {
              const productInfo = products.find(p => p.id === item.product_id);
              return (
                <div key={item.product_id} className="bg-white p-3 rounded-lg text-[10px] space-y-2 shadow-sm border border-border/50">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span className="truncate max-w-[150px]">{productInfo?.name || item.product_name}</span>
                    <button type="button" onClick={()=>handleRemoveLookItem(item.product_id, item.target_image_url)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground">Vị trí X (%)</span>
                      <Slider 
                        value={[item.x_position]} 
                        max={100} 
                        onValueChange={([v]) => handleUpdateLookItemPosition(item.product_id, item.target_image_url, 'x_position', v)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground">Vị trí Y (%)</span>
                      <Slider 
                        value={[item.y_position]} 
                        max={100} 
                        onValueChange={([v]) => handleUpdateLookItemPosition(item.product_id, item.target_image_url, 'y_position', v)} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}