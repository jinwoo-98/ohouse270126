import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/hooks/useProducts";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { SubcategoryList } from "@/components/category/SubcategoryList";
import { ProductCard } from "@/components/ProductCard";
import { CategoryBottomContent } from "@/components/category/CategoryBottomContent";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const categoryInfo: Record<string, { title: string; parent?: string }> = {
  "phong-khach": { title: "Phòng Khách" },
  "phong-ngu": { title: "Phòng Ngủ" },
  "phong-an": { title: "Phòng Ăn" },
  "ban-ghe": { title: "Bàn & Ghế" },
  "den-trang-tri": { title: "Đèn Trang Trí" },
  "decor": { title: "Decor" },
  "noi-that": { title: "Tất Cả Nội Thất" },
  "sale": { title: "Khuyến Mãi" },
  "ban-chay": { title: "Bán Chạy" },
  "moi": { title: "Sản Phẩm Mới" },
};

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

function FilterSection({ title, options, selected, onChange }: { title: string, options: string[], selected: string[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  if (!options || options.length === 0) return null;
  const displayOptions = showAll ? options : options.slice(0, 5);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="py-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full group">
        <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-charcoal">{title}</h4>
        {isOpen ? <Minus className="w-3 h-3 text-muted-foreground" /> : <Plus className="w-3 h-3 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-2 animate-accordion-down">
        {displayOptions.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group/item p-1.5 -ml-1.5 rounded-lg transition-colors">
            <Checkbox checked={selected.includes(opt)} onCheckedChange={() => onChange(opt)} className="data-[state=checked]:bg-primary" />
            <span className={cn("text-sm font-medium", selected.includes(opt) ? "text-primary font-bold" : "text-foreground/80")}>{opt}</span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CategoryPage() {
  const location = useLocation();
  const categorySlug = location.pathname.split('/').pop() || 'noi-that';
  const { products, filters, updateFilters, toggleFilter, toggleDynamicFilter, clearFilters, isLoading, categoryAttributes, currentCategory } = useProducts(categorySlug);

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const pageTitle = currentCategory?.name || categoryInfo[categorySlug]?.title || "Danh Mục";
  const isParent = currentCategory ? !currentCategory.parent_id : true;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="pt-6 pb-2">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground mb-6 uppercase tracking-widest">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-bold">{pageTitle}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-charcoal mb-8 uppercase tracking-widest">{pageTitle}</h1>
          </div>
        </div>

        {/* Toolbar - No Background unless sticky */}
        <div className={cn(
          "z-40 transition-all duration-300",
          isScrolled ? "fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md shadow-medium py-2" : "relative py-3 mb-8"
        )}>
          <div className="container-luxury flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-6">
              <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="hidden lg:flex items-center gap-3 px-5 py-2 hover:bg-secondary/50 text-xs font-bold uppercase tracking-widest rounded-lg">
                {isSidebarVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"} <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <div className="hidden lg:flex items-center gap-3 ml-2 pl-6">
                <Switch checked={filters.saleOnly} onCheckedChange={(val) => updateFilters({ saleOnly: val })} id="sale-filter" />
                <label htmlFor="sale-filter" className="text-xs font-bold uppercase tracking-widest text-charcoal cursor-pointer">Chỉ hiện Sale</label>
              </div>
            </div>
            <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
              <SelectTrigger className="w-40 md:w-52 border-none bg-transparent text-[10px] md:text-xs font-bold uppercase h-10 shadow-none">
                <div className="flex items-center gap-2"><ArrowUpDown className="w-3.5 h-3.5 opacity-50" /><SelectValue placeholder="Sắp xếp" /></div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-elevated"><SelectItem value="manual">Thứ tự ưu tiên</SelectItem><SelectItem value="newest">Mới nhất</SelectItem><SelectItem value="popular">Bán chạy nhất</SelectItem><SelectItem value="price-asc">Giá thấp đến cao</SelectItem><SelectItem value="price-desc">Giá cao đến thấp</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <div className="container-luxury">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <AnimatePresence mode="wait">
              {isSidebarVisible && (
                <motion.aside initial={{ opacity: 0, x: -20, width: 0 }} animate={{ opacity: 1, x: 0, width: 280 }} exit={{ opacity: 0, x: -20, width: 0 }} className="hidden lg:block shrink-0 sticky top-28 z-10">
                  <div className="w-[280px] max-h-[calc(100vh-140px)] overflow-y-auto pr-4 custom-scrollbar pb-10">
                    <SubcategoryList currentSlug={categorySlug} />
                    <FilterSection title="Khoảng Giá" options={priceRanges.map(r => r.label)} selected={filters.priceRange.map(v => priceRanges.find(r => r.value === v)?.label || "")} onChange={(label) => toggleFilter('priceRange', priceRanges.find(r => r.label === label)?.value || "")} />
                    {categoryAttributes.map(attr => <FilterSection key={attr.id} title={attr.name} options={attr.options || []} selected={filters.dynamicAttributes[attr.name] || []} onChange={(val) => toggleDynamicFilter(attr.name, val)} />)}
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive p-0 h-auto justify-start hover:bg-transparent mt-6" onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="flex-1 min-w-0">
              <div className={cn("grid grid-cols-2 gap-4 md:gap-6 lg:gap-8", isSidebarVisible ? "xl:grid-cols-4" : "xl:grid-cols-5")}>
                {isLoading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.length === 0 ? (
                  <div className="col-span-full py-24 text-center bg-secondary/10 rounded-3xl"><p className="text-muted-foreground font-medium">Chưa có sản phẩm nào phù hợp.</p></div>
                ) : products.map((product) => <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />)}
              </div>
              {!isLoading && <CategoryBottomContent categoryId={currentCategory?.id} categorySlug={currentCategory?.slug || categorySlug} seoContent={currentCategory?.seo_content} isParentCategory={isParent} />}
            </div>
          </div>
        </div>
      </main>
      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
      <Footer />
    </div>
  );
}