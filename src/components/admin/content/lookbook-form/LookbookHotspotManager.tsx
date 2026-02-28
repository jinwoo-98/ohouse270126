import { useState, useMemo } from "react";
import { Plus, X, Search, Tag as LabelIcon, Monitor, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  allEditingImages: { url: string, label: string, type: string }[];
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
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const lookItemsForActiveImage = useMemo(() => 
    lookItems.filter(i => i.target_image_url === activeEditingImage),
    [lookItems, activeEditingImage]
  );

  const currentImageInfo = useMemo(() => {
    return allEditingImages.find(img => img.url === activeEditingImage);
  }, [activeEditingImage, allEditingImages]);

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

  // Xác định tỉ lệ khung hình hiển thị
  const getAspectRatioClass = () => {
    if (currentImageInfo?.type === 'homepage') {
      return previewMode === 'desktop' ? "aspect-[2/1]" : "aspect-video"; // 2:1 vs 16:9
    }
    return "aspect-[4/3]"; // Ảnh chính/phụ luôn 4:3
  };

  return (
    <div className="space-y-6">
      {/* Hotspot Preview */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ảnh & Hotspot</h3>
            {currentImageInfo?.type === 'homepage' && (
              <div className="flex bg-secondary/50 p-1 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={cn("p-1.5 rounded-md transition-all", previewMode === 'desktop' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
                  title="Chế độ Desktop (2:1)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={cn("p-1.5 rounded-md transition-all", previewMode === 'mobile' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
                  title="Chế độ Mobile (16:9)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="text-[9px] uppercase font-bold">
            {currentImageInfo?.type === 'homepage' 
              ? (previewMode === 'desktop' ? 'Tỉ lệ 2:1 (Desktop)' : 'Tỉ lệ 16:9 (Mobile)') 
              : 'Tỉ lệ 4:3 (Thống nhất)'}
          </Badge>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {allEditingImages.map(img => (
            <button 
              key={img.url} 
              type="button" 
              onClick={() => setActiveEditingImage(img.url)} 
              className={cn(
                "relative w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all", 
                activeEditingImage === img.url ? "border-primary ring-2 ring-primary/10" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={img.url} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold uppercase py-1 px-1 truncate">
                {img.label}
              </div>
            </button>
          ))}
        </div>
        
        <div className={cn(
          "bg-gray-100 rounded-2xl relative overflow-hidden border border-border/50 shadow-inner transition-all duration-500 mx-auto",
          getAspectRatioClass(),
          currentImageInfo?.type === 'homepage' && previewMode === 'mobile' ? "max-w-md" : "w-full"
        )}>
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
        {currentImageInfo?.type === 'homepage' && (
          <p className="text-[10px] text-muted-foreground italic text-center">
            * Nút sản phẩm (Hotspot) được tính theo %, sẽ tự động khớp khi tỉ lệ khung hình thay đổi.
          </p>
        )}
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