import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  "sofa": { title: "Ghế Sofa", parent: "phong-khach" },
  "ban-tra": { title: "Bàn Trà", parent: "phong-khach" },
  "ke-tivi": { title: "Kệ Tivi", parent: "phong-khach" },
  "giuong": { title: "Giường Ngủ", parent: "phong-ngu" },
  "ban-an": { title: "Bàn Ăn", parent: "phong-an" },
};

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

const materials = ["Gỗ Óc Chó", "Gỗ Sồi", "Đá Marble", "Da Thật", "Vải Nhung", "Kim Loại"];
const styles = ["Luxury", "Minimalist", "Modern", "Classic"];

export default function CategoryPage() {
  const location = useLocation();
  const categorySlug = location.pathname.split('/').pop() || 'noi-that';
  
  const { products, filters, updateFilters, toggleFilter, clearFilters, isLoading } = useProducts(categorySlug);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const category = categoryInfo[categorySlug] || { title: "Danh Mục" };
  const parentCategory = category.parent ? categoryInfo[category.parent] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="pt-6 pb-2">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              {parentCategory && (
                <>
                  <Link to={`/${category.parent}`} className="hover:text-primary transition-colors">{parentCategory.title}</Link>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              <span className="text-foreground capitalize">{category.title}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8 uppercase tracking-widest">{category.title}</h1>
          </div>
        </div>

        <div className={cn(
          "z-40 transition-all duration-300 border-y border-border/40 bg-background/95 backdrop-blur-md",
          isScrolled ? "fixed top-0 left-0 right-0 shadow-subtle py-2" : "relative py-3 mb-8"
        )}>
          <div className="container-luxury flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-6">
              <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className="hidden lg:flex items-center gap-3 px-5 py-2 border border-charcoal/20 hover:bg-secondary transition-all text-xs font-bold uppercase tracking-widest"
              >
                {isSidebarVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                <ArrowUpDown className="w-4 h-4" />
              </button>

              <Sheet open={showFiltersMobile} onOpenChange={setShowFiltersMobile}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden h-10 px-4 md:px-6 border-charcoal/20 rounded-none gap-2 font-bold text-xs uppercase tracking-widest">
                    Bộ lọc <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-xs p-0 flex flex-col z-[100]">
                  <SheetHeader className="p-6 border-b border-border">
                    <SheetTitle className="text-left font-bold text-sm uppercase tracking-widest">Bộ lọc sản phẩm</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <SubcategoryList currentSlug={categorySlug} />
                    <div className="space-y-8">
                      <div>
                        <h4 className="font-bold mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Khoảng giá</h4>
                        {priceRanges.map((range) => (
                          <label key={range.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                            <Checkbox checked={filters.priceRange.includes(range.value)} onCheckedChange={() => toggleFilter('priceRange', range.value)} />
                            <span className="text-sm font-medium">{range.label}</span>
                          </label>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-bold mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Chất liệu</h4>
                        {materials.map((m) => (
                          <label key={m} className="flex items-center gap-3 cursor-pointer py-1.5">
                            <Checkbox checked={filters.materials.includes(m)} onCheckedChange={() => toggleFilter('materials', m)} />
                            <span className="text-sm font-medium">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border bg-card">
                    <Button className="w-full btn-hero h-12 text-xs font-bold" onClick={() => setShowFiltersMobile(false)}>Xem kết quả</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden lg:flex items-center gap-3 ml-2">
                <Switch checked={filters.saleOnly} onCheckedChange={(val) => updateFilters({ saleOnly: val })} />
                <span className="text-xs font-bold uppercase tracking-widest text-charcoal">Sale</span>
              </div>
            </div>

            <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
              <SelectTrigger className="w-36 md:w-48 border border-charcoal/20 lg:border-none bg-transparent text-[10px] md:text-xs font-bold uppercase tracking-widest h-10 shadow-none rounded-none">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-[110]">
                <SelectItem value="manual">Thứ tự ưu tiên (Mặc định)</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="popular">Bán chạy nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="container-luxury">
          <div className="flex flex-col lg:flex-row gap-12 items-start relative">
            <AnimatePresence mode="wait">
              {isSidebarVisible && (
                <motion.aside 
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 280 }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  className="hidden lg:block shrink-0 sticky top-24 z-10"
                >
                  <div className="w-[280px] space-y-10 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 custom-scrollbar">
                    <SubcategoryList currentSlug={categorySlug} />
                    <div className="space-y-10 pt-4">
                      <div className="border-t border-border/40 pt-8">
                        <h4 className="font-bold mb-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Khoảng giá</h4>
                        <div className="space-y-3">
                          {priceRanges.map((range) => (
                            <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                              <Checkbox checked={filters.priceRange.includes(range.value)} onCheckedChange={() => toggleFilter('priceRange', range.value)} />
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-charcoal">{range.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive p-0 h-auto justify-start" onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="flex-1 min-w-0">
              {/* Cập nhật Grid để hiện nhiều sp hơn trên màn hình rộng */}
              <div className={cn(
                "grid grid-cols-2 gap-4 md:gap-6 lg:gap-8", 
                isSidebarVisible ? "xl:grid-cols-4" : "xl:grid-cols-5"
              )}>
                {isLoading ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-muted-foreground">Chưa có sản phẩm nào trong danh mục này.</div>
                ) : (
                  products.map((product, index) => (
                    <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
      <Footer />
    </div>
  );
}