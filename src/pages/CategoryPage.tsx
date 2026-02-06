import { useState, useEffect, useMemo } from "react";
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
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { SubcategoryList } from "@/components/category/SubcategoryList";
import { ProductCard } from "@/components/ProductCard";
import { CategoryBottomContent } from "@/components/category/CategoryBottomContent";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { ShopTheLookCard } from "@/components/category/ShopTheLookCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

function FilterSection({ title, options, selected, onChange }: { title: string, options: string[], selected: string[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  if (!options || options.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="py-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full group">
        <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-charcoal transition-colors">{title}</h4>
        {isOpen ? <Minus className="w-3 h-3 text-muted-foreground" /> : <Plus className="w-3 h-3 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-2 animate-accordion-down">
        {options.map((opt) => (
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [shopLooks, setShopLooks] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null); // State cho QuickView

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Parent Category for Breadcrumb & Shop The Look
  useEffect(() => {
    async function fetchParent() {
      if (currentCategory?.parent_id) {
        const { data } = await supabase.from('categories').select('id, name, slug').eq('id', currentCategory.parent_id).single();
        setParentCategory(data);
      } else {
        setParentCategory(null);
      }
    }
    fetchParent();
  }, [currentCategory]);
  
  const pageTitle = currentCategory?.name || "Nội Thất";
  const isParent = currentCategory ? !currentCategory.parent_id : true;

  const displayItems = useMemo(() => {
    const items: any[] = products.map(p => ({ type: 'product', data: p, id: p.id }));
    
    if (shopLooks.length > 0) {
      const lookItem = { type: 'look', data: shopLooks[0], id: `look-${shopLooks[0].id}` };
      // Chèn vào vị trí thứ 3 (sau 2 sản phẩm đầu)
      const insertionIndex = Math.min(2, items.length);
      items.splice(insertionIndex, 0, lookItem);
    }
    return items;
  }, [products, shopLooks]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Header Section: Breadcrumb & Title (Seamless) */}
        <div className="pt-10 pb-4">
          <div className="container-luxury">
            {/* Detailed Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              
              {parentCategory && (
                <>
                  <Link to={`/${parentCategory.slug}`} className="hover:text-primary transition-colors">
                    {parentCategory.name}
                  </Link>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </>
              )}
              
              <span className="text-charcoal">{pageTitle}</span>
            </div>

            {/* Title & Count */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-xl md:text-3xl font-display font-bold text-charcoal uppercase tracking-tight leading-none">
                  {pageTitle}
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-3">
                  {isLoading ? "Đang cập nhật..." : `${products.length} sản phẩm`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar (Sticky & Transparent) */}
        <div className={cn(
          "z-40 transition-all duration-500",
          isScrolled ? "fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md shadow-medium py-3" : "relative py-4 mb-8"
        )}>
          <div className="container-luxury flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-8">
              <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)} 
                className="hidden lg:flex items-center gap-3 px-6 py-2.5 hover:bg-secondary/50 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all"
              >
                {isSidebarVisible ? "Đóng bộ lọc" : "Mở bộ lọc"} 
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              <div className="hidden lg:flex items-center gap-4 border-l border-border/60 pl-8">
                <Switch checked={filters.saleOnly} onCheckedChange={(val) => updateFilters({ saleOnly: val })} id="sale-filter" />
                <label htmlFor="sale-filter" className="text-[10px] font-bold uppercase tracking-widest text-charcoal cursor-pointer select-none">Ưu đãi hấp dẫn</label>
              </div>

              {/* Mobile Filter Trigger */}
              <Sheet open={showFiltersMobile} onOpenChange={setShowFiltersMobile}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="lg:hidden h-10 rounded-full px-6 gap-2 font-bold text-[10px] uppercase tracking-widest bg-secondary/50 hover:bg-secondary">
                    Lọc <SlidersHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-xs p-0 border-none shadow-elevated">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <h3 className="font-bold text-sm uppercase tracking-widest">Bộ lọc sản phẩm</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <SubcategoryList currentSlug={categorySlug} />
                      <FilterSection title="Khoảng Giá" options={priceRanges.map(r => r.label)} selected={filters.priceRange.map(v => priceRanges.find(r => r.value === v)?.label || "")} onChange={(label) => toggleFilter('priceRange', priceRanges.find(r => r.label === label)?.value || "")} />
                      {categoryAttributes.map(attr => <FilterSection key={attr.id} title={attr.name} options={attr.options || []} selected={filters.dynamicAttributes[attr.name] || []} onChange={(val) => toggleDynamicFilter(attr.name, val)} />)}
                    </div>
                    <div className="p-6 bg-card border-t"><Button className="w-full btn-hero h-12" onClick={() => setShowFiltersMobile(false)}>Xem kết quả</Button></div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
              <SelectTrigger className="w-44 md:w-56 border-none bg-transparent text-[10px] md:text-xs font-bold uppercase h-10 shadow-none focus:ring-0">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                  <SelectValue placeholder="Sắp xếp theo" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-elevated">
                <SelectItem value="manual">Thứ tự ưu tiên</SelectItem>
                <SelectItem value="newest">Sản phẩm mới nhất</SelectItem>
                <SelectItem value="popular">Bán chạy nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="container-luxury">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <AnimatePresence mode="wait">
              {isSidebarVisible && (
                <motion.aside 
                  initial={{ opacity: 0, x: -20, width: 0 }} 
                  animate={{ opacity: 1, x: 0, width: 280 }} 
                  exit={{ opacity: 0, x: -20, width: 0 }} 
                  className="hidden lg:block shrink-0 sticky top-28 z-10"
                >
                  <div className="w-[280px] max-h-[calc(100vh-140px)] overflow-y-auto pr-4 custom-scrollbar pb-10">
                    <SubcategoryList currentSlug={categorySlug} />
                    <FilterSection title="Khoảng Giá" options={priceRanges.map(r => r.label)} selected={filters.priceRange.map(v => priceRanges.find(r => r.value === v)?.label || "")} onChange={(label) => toggleFilter('priceRange', priceRanges.find(r => r.label === label)?.value || "")} />
                    {categoryAttributes.map(attr => <FilterSection key={attr.id} title={attr.name} options={attr.options || []} selected={filters.dynamicAttributes[attr.name] || []} onChange={(val) => toggleDynamicFilter(attr.name, val)} />)}
                    
                    <button 
                      onClick={clearFilters}
                      className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors text-left mt-8 pt-6 border-t border-border/40"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="flex-1 min-w-0">
              <div className={cn(
                "grid grid-cols-2 gap-2 md:gap-6 lg:gap-10", // Đã đổi gap-3 thành gap-2
                isSidebarVisible ? "xl:grid-cols-4" : "xl:grid-cols-5"
              )}>
                {isLoading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) : displayItems.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-secondary/10 rounded-[32px]">
                    <p className="text-muted-foreground font-medium italic">Không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.</p>
                    <Button variant="link" onClick={clearFilters} className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px]">Quay lại danh mục</Button>
                  </div>
                ) : displayItems.map((item) => (
                  item.type === 'look' 
                    ? <ShopTheLookCard key={item.id} look={item.data} onQuickView={setQuickViewProduct} />
                    : <ProductCard key={item.id} product={item.data} />
                ))}
              </div>
              
              {!isLoading && (
                <CategoryBottomContent 
                  categoryId={currentCategory?.slug} 
                  parentCategoryId={parentCategory?.slug}
                  seoContent={currentCategory?.seo_content} 
                  isParentCategory={isParent} 
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}