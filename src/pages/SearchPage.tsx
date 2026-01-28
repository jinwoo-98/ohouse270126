import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, Heart, ShoppingBag, Loader2, SlidersHorizontal, X, Eye, Star } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

const materials = ["Gỗ Óc Chó", "Gỗ Sồi", "Đá Marble", "Da Thật", "Vải Nhung", "Kim Loại"];
const styles = ["Luxury", "Minimalist", "Modern", "Classic"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const { products, filters, updateFilters, toggleFilter, clearFilters, isLoading } = useProducts("noi-that", query);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    updateFilters({ searchQuery: query });
  }, [query]);

  const hasActiveFilters = filters.priceRange.length > 0 || filters.materials.length > 0 || filters.styles.length > 0;

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
            {/* Sidebar Filters */}
            <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block fixed inset-0 z-40 bg-background p-6 lg:static lg:p-0' : 'hidden lg:block'}`}>
              <div className="lg:bg-card lg:rounded-lg lg:p-5 lg:shadow-subtle lg:sticky lg:top-24">
                {showFilters && (
                  <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h3 className="font-bold text-xl">Bộ Lọc</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></Button>
                  </div>
                )}
                <h3 className="hidden lg:block font-bold text-lg mb-4">Bộ Lọc</h3>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Khoảng Giá</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={filters.priceRange.includes(range.value)} onCheckedChange={() => toggleFilter('priceRange', range.value)} />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Chất Liệu</h4>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <label key={material} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={filters.materials.includes(material)} onCheckedChange={() => toggleFilter('materials', material)} />
                        <span className="text-sm">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>Xóa Bộ Lọc</Button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal className="w-4 h-4 mr-2" />Lọc</Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
                      <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="popular">Phổ biến nhất</SelectItem>
                        <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                        <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Summary */}
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Đang lọc:</span>
                      
                      {filters.priceRange.map(val => (
                        <Badge key={val} variant="secondary" className="pl-3 pr-1 py-1 gap-1 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                          {priceRanges.find(r => r.value === val)?.label}
                          <button onClick={() => toggleFilter('priceRange', val)} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}

                      {filters.materials.map(val => (
                        <Badge key={val} variant="secondary" className="pl-3 pr-1 py-1 gap-1 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                          {val}
                          <button onClick={() => toggleFilter('materials', val)} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}

                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 px-2 hover:bg-destructive/10 hover:text-destructive">Xóa tất cả</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24 bg-secondary/30 rounded-lg">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm nào</h2>
                  <p className="text-muted-foreground mt-2">Hãy thử sử dụng các từ khóa khác hoặc xóa bộ lọc.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => {
                    const isFavorite = isInWishlist(product.id);
                    const rating = product.fake_rating || 5;
                    const reviews = product.fake_review_count || 0;
                    const sold = product.fake_sold || 0;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="group card-luxury relative h-full flex flex-col">
                          <div className="relative aspect-square img-zoom">
                            <Link to={`/san-pham/${product.id}`} className="block h-full">
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {product.is_new && <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">Mới</span>}
                                {product.is_sale && <span className="bg-white text-charcoal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">Sale</span>}
                              </div>
                            </Link>
                            
                            {/* Interaction Buttons */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(product);
                                }}
                                className={`p-2.5 rounded-full shadow-medium transition-all pointer-events-auto ${isFavorite ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-primary hover:text-primary-foreground'}`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1 });
                                }}
                                className="p-2.5 bg-card rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-all pointer-events-auto"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            </div>

                            <button 
                              onClick={() => setSelectedProduct(product)}
                              className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm text-foreground p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-primary hover:text-primary-foreground shadow-sm flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Xem nhanh</span>
                            </button>
                          </div>
                          
                          <div className="p-4 flex-1 flex flex-col">
                            <Link to={`/san-pham/${product.id}`}>
                              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">{product.name}</h3>
                            </Link>
                            
                            <div className="flex items-center gap-1 mb-3">
                              <div className="flex text-primary">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3", i < Math.floor(rating) ? "fill-current" : "text-gray-300")} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground ml-1">({reviews})</span>
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
                                {product.original_price && (
                                  <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                                )}
                              </div>
                              {sold > 0 && <p className="text-[10px] text-muted-foreground mt-1">Đã bán {sold}</p>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <QuickViewSheet 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <Footer />
    </div>
  );
}