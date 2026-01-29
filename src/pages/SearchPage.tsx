import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/useProducts";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const { products, filters, updateFilters, toggleFilter, clearFilters, isLoading } = useProducts("noi-that", query);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    updateFilters({ searchQuery: query });
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Tìm kiếm</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kết quả tìm kiếm</h1>
          <p className="text-muted-foreground mb-8">
            {isLoading ? "Đang tìm kiếm..." : `Tìm thấy ${products.length} sản phẩm cho "${query}"`}
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:bg-card lg:rounded-2xl lg:p-6 lg:shadow-subtle lg:sticky lg:top-24 border">
                <h3 className="font-bold text-lg mb-4 uppercase tracking-widest">Bộ Lọc</h3>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Khoảng Giá</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.value} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox checked={filters.priceRange.includes(range.value)} onCheckedChange={() => toggleFilter('priceRange', range.value)} />
                        <span className="text-sm font-medium">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs font-bold" onClick={clearFilters}>XÓA BỘ LỌC</Button>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal className="w-4 h-4 mr-2" />Lọc</Button>
                <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Mặc định</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="popular">Bán chạy</SelectItem>
                    <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24 bg-secondary/20 rounded-3xl">
                  <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm nào</h2>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
      <Footer />
    </div>
  );
}