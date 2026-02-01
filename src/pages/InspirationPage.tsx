import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import { InspirationLookCard } from "@/components/inspiration/InspirationLookCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useLookbookFilters } from "@/hooks/useLookbookFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Component con cho các bộ lọc phụ (Style, Material)
function FilterCollapsible({ title, options, selected, onSelect, filterKey }: { title: string, options: string[], selected: string, onSelect: (value: string) => void, filterKey: string }) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (options.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border-b border-border/40">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 group">
        <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-charcoal group-hover:text-primary transition-colors">{title}</h4>
        {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 space-y-2 animate-accordion-down">
        <label className="flex items-center gap-3 cursor-pointer group/item p-1.5 -ml-1.5 rounded-lg transition-colors">
          <Checkbox 
            id={`${filterKey}-all`} 
            checked={selected === "all"} 
            onCheckedChange={() => onSelect("all")} 
            className="data-[state=checked]:bg-primary" 
          />
          <span className={cn("text-sm font-medium", selected === "all" ? "text-primary font-bold" : "text-foreground/80")}>Tất Cả</span>
        </label>
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group/item p-1.5 -ml-1.5 rounded-lg transition-colors">
            <Checkbox 
              id={`${filterKey}-${opt}`} 
              checked={selected === opt} 
              onCheckedChange={() => onSelect(opt)} 
              className="data-[state=checked]:bg-primary" 
            />
            <span className={cn("text-sm font-medium", selected === opt ? "text-primary font-bold" : "text-foreground/80")}>{opt}</span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}


export default function InspirationPage() {
  const { 
    filteredLooks, 
    filterOptions, 
    filters, 
    updateFilter, 
    isLoading 
  } = useLookbookFilters();
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Cảm hứng thiết kế" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Cảm Hứng Thiết Kế</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Khám phá những ý tưởng nội thất độc đáo và tinh tế từ OHOUSE
              </p>
            </motion.div>
          </div>
        </section>

        {/* Lookbook Grid */}
        <section className="py-12 md:py-16">
          <div className="container-luxury">
            
            {/* Filter Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 p-4 bg-card rounded-2xl shadow-subtle border border-border/40">
              <div className="flex items-center gap-3 shrink-0">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest text-charcoal">Bộ Lọc Không Gian</span>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap gap-3 flex-1">
                {/* Filter 1: Category (Phòng) - Sử dụng Select */}
                <Select 
                  value={filters.selectedCategorySlug} 
                  onValueChange={(val) => updateFilter('selectedCategorySlug', val)}
                >
                  <SelectTrigger className="w-full md:w-48 h-11 rounded-xl bg-secondary/50 border-border/60 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Chọn không gian" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {filterOptions.categories.map(cat => (
                      <SelectItem key={cat.slug} value={cat.slug} className="text-sm">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Filter 2: Style (Phong cách) - Sử dụng Select */}
                <Select 
                  value={filters.selectedStyle} 
                  onValueChange={(val) => updateFilter('selectedStyle', val)}
                >
                  <SelectTrigger className="w-full md:w-48 h-11 rounded-xl bg-secondary/50 border-border/60 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Chọn phong cách" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="text-sm">Tất Cả Phong Cách</SelectItem>
                    {filterOptions.styles.map(style => (
                      <SelectItem key={style} value={style} className="text-sm">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Filter 3: Material (Chất liệu) - Sử dụng Select */}
                <Select 
                  value={filters.selectedMaterial} 
                  onValueChange={(val) => updateFilter('selectedMaterial', val)}
                >
                  <SelectTrigger className="w-full md:w-48 h-11 rounded-xl bg-secondary/50 border-border/60 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Chọn chất liệu" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="text-sm">Tất Cả Chất Liệu</SelectItem>
                    {filterOptions.materials.map(material => (
                      <SelectItem key={material} value={material} className="text-sm">
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Lookbook Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : filteredLooks.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl text-muted-foreground italic">
                Không tìm thấy Lookbook nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredLooks.map((look, index) => (
                  <InspirationLookCard key={look.id} look={look} index={index} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-charcoal text-cream">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Cần Tư Vấn Thiết Kế Riêng?</h2>
            <p className="text-taupe mb-8 max-w-xl mx-auto">
              Đội ngũ kiến trúc sư của chúng tôi sẵn sàng biến ý tưởng của bạn thành hiện thực.
            </p>
            <Button className="btn-hero" asChild>
              <Link to="/thiet-ke">
                Yêu Cầu Thiết Kế
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}