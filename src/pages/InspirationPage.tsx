import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LayoutGrid, ChevronDown, ChevronUp, Home, Palette, Layers, Zap } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Component con cho các bộ lọc phụ (Style, Material, Color)
function FilterCollapsible({ title, options, selected, onSelect, filterKey }: { title: string, options: string[], selected: string, onSelect: (value: string) => void, filterKey: string }) {
  
  if (options.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
      <div className="space-y-1">
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
      </div>
    </div>
  );
}

// Component cho bộ lọc chính (Không gian)
function SpaceFilter({ filterOptions, filters, updateFilter }: any) {
  const currentCategory = filterOptions.categories.find((c: any) => c.slug === filters.selectedCategorySlug);
  const isFiltered = filters.selectedCategorySlug !== "all";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-10 px-3 md:h-11 md:px-6 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest gap-1 md:gap-2 border-border/60 hover:bg-secondary/50 flex-1 min-w-0",
            isFiltered && "bg-primary text-white border-primary hover:bg-primary/90"
          )}
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" />
          <span className="truncate">{isFiltered ? currentCategory?.name : "Không Gian"}</span>
          <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-30" align="start">
        <div className="space-y-1">
          {filterOptions.categories.map((cat: any) => (
            <button
              key={cat.slug}
              onClick={() => updateFilter('selectedCategorySlug', cat.slug)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors",
                filters.selectedCategorySlug === cat.slug ? "bg-primary text-white font-bold" : "hover:bg-secondary/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Component cho bộ lọc phụ (Style, Material, Color)
function SubFilter({ title, icon: Icon, options, selected, filterKey, updateFilter }: any) {
  const isFiltered = selected !== "all";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-10 px-3 md:h-11 md:px-6 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest gap-1 md:gap-2 border-border/60 hover:bg-secondary/50 flex-1 min-w-0",
            isFiltered && "bg-primary text-white border-primary hover:bg-primary/90"
          )}
        >
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" />
          <span className="truncate">{title}</span>
          <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-30" align="start">
        <FilterCollapsible 
          title={title} 
          options={options} 
          selected={selected} 
          onSelect={(val) => updateFilter(filterKey, val)} 
          filterKey={filterKey}
        />
      </PopoverContent>
    </Popover>
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

  const isAnyFilterActive = filters.selectedCategorySlug !== 'all' || filters.selectedStyle !== 'all' || filters.selectedMaterial !== 'all' || filters.selectedColor !== 'all';

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
            
            {/* Filter Row - 4 Buttons (Responsive) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10">
              
              {/* 1. Không Gian (Category) */}
              <SpaceFilter 
                filterOptions={filterOptions} 
                filters={filters} 
                updateFilter={updateFilter} 
              />
              
              {/* 2. Phong Cách (Style) */}
              <SubFilter
                title="Phong Cách"
                icon={Layers}
                options={filterOptions.styles}
                selected={filters.selectedStyle}
                filterKey="selectedStyle"
                updateFilter={updateFilter}
              />
              
              {/* 3. Chất Liệu (Material) */}
              <SubFilter
                title="Chất Liệu"
                icon={Zap}
                options={filterOptions.materials}
                selected={filters.selectedMaterial}
                filterKey="selectedMaterial"
                updateFilter={updateFilter}
              />
              
              {/* 4. Màu Sắc (Color) */}
              <SubFilter
                title="Màu Sắc"
                icon={Palette}
                options={filterOptions.colors}
                selected={filters.selectedColor}
                filterKey="selectedColor"
                updateFilter={updateFilter}
              />
              
              {/* Clear Filter Button */}
              {isAnyFilterActive && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    updateFilter('selectedCategorySlug', 'all');
                    updateFilter('selectedStyle', 'all');
                    updateFilter('selectedMaterial', 'all');
                    updateFilter('selectedColor', 'all');
                  }}
                  className="h-11 px-4 text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                >
                  Xóa lọc
                </Button>
              )}
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