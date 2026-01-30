import { useState, useEffect, useMemo } from "react";
import { 
  Star, Minus, Plus, ShoppingBag, Heart, 
  Truck, Shield, ChevronDown, ChevronUp, Ruler, Info, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn, formatPrice } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface ProductInfoProps {
  product: any;
  attributes: any[];
  reviewsCount: number;
}

export function ProductInfo({ product, attributes, reviewsCount }: ProductInfoProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  
  // State for collapsibles
  const [isShortDescOpen, setIsShortDescOpen] = useState(false);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  const tierConfig = product.tier_variants_config || [];

  useEffect(() => {
    const fetchVariants = async () => {
      if (tierConfig.length > 0) {
        const { data } = await supabase.from('product_variants').select('*').eq('product_id', product.id);
        setVariants(data || []);
      }
    };
    fetchVariants();
  }, [product.id, tierConfig.length]);

  const activeVariant = useMemo(() => {
    if (tierConfig.length === 0) return null;
    const allSelected = tierConfig.every((tier: any) => selectedValues[tier.name]);
    if (!allSelected) return null;
    return variants.find(v => Object.entries(v.tier_values).every(([key, val]) => selectedValues[key] === val));
  }, [variants, selectedValues, tierConfig]);

  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayOriginalPrice = activeVariant ? activeVariant.original_price : product.original_price;

  const handleAddToCart = () => {
    if (tierConfig.length > 0 && !activeVariant) {
      const missing = tierConfig.find((t: any) => !selectedValues[t.name]);
      toast.error(`Vui lòng chọn ${missing?.name}`);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image_url,
      quantity,
      variant: activeVariant ? Object.values(activeVariant.tier_values).join(" / ") : undefined,
      variant_id: activeVariant?.id,
      slug: product.slug
    });
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary uppercase tracking-widest text-[9px] font-bold border-none">
            {product.category_id}
          </Badge>
          {product.is_new && <Badge className="bg-blue-600 text-[9px] h-5 font-bold uppercase">Mới</Badge>}
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal leading-tight">{product.name}</h1>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
          {displayOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through decoration-destructive/30">{formatPrice(displayOriginalPrice)}</span>
          )}
        </div>
      </div>

      {/* 1. VARIANTS SELECTION */}
      {tierConfig.length > 0 && (
        <div className="space-y-6">
          {tierConfig.map((tier: any, idx: number) => (
            <div key={idx} className="space-y-3">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                {tier.name}: <span className="text-charcoal">{selectedValues[tier.name] || "Chưa chọn"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {tier.values.map((val: string) => (
                  <button
                    key={val}
                    onClick={() => setSelectedValues(prev => ({ ...prev, [tier.name]: val }))}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                      selectedValues[tier.name] === val 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border bg-white hover:border-primary/40 text-charcoal"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ACTIONS ROW (Qty + Cart + Heart) */}
      <div className="flex items-center gap-3 py-4 border-y border-border/50">
        <div className="flex items-center rounded-xl h-12 w-28 bg-secondary/50 border border-border">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="w-3.5 h-3.5" /></button>
          <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        
        <Button 
          size="lg" 
          className="flex-1 btn-hero h-12 rounded-xl text-[10px] font-bold shadow-none" 
          onClick={handleAddToCart}
        >
          <ShoppingBag className="w-4 h-4 mr-2" /> THÊM VÀO GIỎ
        </Button>
        
        <Button 
          size="icon" 
          variant="outline" 
          className={cn("h-12 w-12 rounded-xl border-border", isInWishlist(product.id) && "text-primary bg-primary/5 border-primary/20")} 
          onClick={() => toggleWishlist(product)}
        >
          <Heart className={cn("w-5 h-5", isInWishlist(product.id) && "fill-current")} />
        </Button>
      </div>

      {/* 3. COLLAPSIBLE SHORT DESCRIPTION */}
      {product.short_description && (
        <Collapsible open={isShortDescOpen} onOpenChange={setIsShortDescOpen} className="border-b border-border/50 pb-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full group py-2 text-left">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Mô tả sản phẩm</span>
            </div>
            {isShortDescOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 animate-accordion-down">
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.short_description}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 4. COLLAPSIBLE DIMENSIONS */}
      {product.dimension_image_url && (
        <Collapsible open={isDimensionsOpen} onOpenChange={setIsDimensionsOpen} className="border-b border-border/50 pb-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full group py-2">
            <div className="flex items-center gap-3">
              <Ruler className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Kích thước</span>
            </div>
            {isDimensionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 animate-accordion-down">
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-white p-2">
              <img src={product.dimension_image_url} alt="Dimensions" className="w-full h-auto object-contain" />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 5. COLLAPSIBLE SPECS */}
      <Collapsible open={isSpecsOpen} onOpenChange={setIsSpecsOpen} className="pb-4">
        <CollapsibleTrigger className="flex items-center justify-between w-full group py-2">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Thông số kỹ thuật</span>
          </div>
          {isSpecsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 animate-accordion-down">
          <div className="grid grid-cols-1 gap-3">
            {attributes.length > 0 ? attributes.map((attr, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-dashed border-border/40 text-sm">
                <span className="text-muted-foreground font-medium shrink-0">{attr.name}</span>
                <span className="text-charcoal font-bold text-right break-words max-w-[70%]">
                  {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
                </span>
              </div>
            )) : <p className="text-xs italic text-muted-foreground">Chưa có thông số chi tiết.</p>}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Badges */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Truck className="w-4 h-4 text-primary" /></div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Giao nhanh 2-5 ngày</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Shield className="w-4 h-4 text-primary" /></div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Bảo hành 2 năm</span>
        </div>
      </div>
    </div>
  );
}