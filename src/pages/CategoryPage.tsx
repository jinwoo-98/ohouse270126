import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, Heart, ShoppingBag, X, Eye, Star } from "lucide-react";
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
import { SubcategoryList } from "@/components/category/SubcategoryList";

const categoryInfo: Record<string, { title: string; description: string }> = {
  "phong-khach": { title: "Phòng Khách", description: "Nội thất phòng khách sang trọng, hiện đại" },
  "phong-ngu": { title: "Phòng Ngủ", description: "Giường, tủ, bàn trang điểm cao cấp" },
  "phong-an": { title: "Phòng Ăn", description: "Bàn ăn, ghế ăn, tủ rượu đẳng cấp" },
  "phong-tam": { title: "Phòng Tắm", description: "Thiết bị vệ sinh và phụ kiện phòng tắm" },
  "phong-lam-viec": { title: "Văn Phòng", description: "Bàn làm việc, ghế công thái học" },
  "den-trang-tri": { title: "Đèn & Decor", description: "Đèn trang trí và phụ kiện decor" },
  "sofa": { title: "Sofa & Ghế", description: "Sofa góc, sofa văng, ghế thư giãn" },
  "ke-tivi": { title: "Kệ Tivi", description: "Kệ tivi gỗ, kệ tivi kết hợp tủ" },
  "ban-an": { title: "Bàn Ăn", description: "Bàn ăn đá, bàn ăn gỗ cao cấp" },
  "ban-tra": { title: "Bàn Trà", description: "Bàn trà phòng khách đa dạng" },
  "ban-lam-viec": { title: "Bàn Làm Việc", description: "Bàn làm việc hiện đại" },
  "giuong": { title: "Giường Ngủ", description: "Giường ngủ bọc da, giường gỗ" },
  "sale": { title: "Khuyến Mãi", description: "Sản phẩm giảm giá đặc biệt" },
  "noi-that": { title: "Tất Cả Nội Thất", description: "Khám phá toàn bộ bộ sưu tập" },
};

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

const materials = ["Gỗ Óc Chó", "Gỗ Sồi", "Đá Marble", "Da Thật", "Vải Nhung", "Inox Mạ Vàng", "Kính Cường Lực", "Gỗ Công Nghiệp", "Pha Lê", "Kim Loại"];
const styles = ["Luxury", "Minimalist", "Modern", "Classic"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function CategoryPage() {
  const location = useLocation();
  const pathSegment = location.pathname.split('/').pop() || 'noi-that';
  const categorySlug = pathSegment;
  
  const { products, filters, updateFilters, toggleFilter, clearFilters, isLoading } = useProducts(categorySlug);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const category = categoryInfo[categorySlug] || { title: "Danh Mục", description: "Khám phá sản phẩm" };
  const hasActiveFilters = filters.priceRange.length > 0 || filters.materials.length > 0 || filters.styles.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb Section */}
        <div className="bg-secondary/30 py-3">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{category.title}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Independent Scrolling Sidebar */}
            <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block fixed inset-0 z-40 bg-background p-6 lg:static lg:p-0' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar lg:pr-4">
                {showFilters && (
                  <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h3 className="font-bold text-xl uppercase tracking-widest">Lọc & Danh Mục</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></Button>
                  </div>
                )}
                
                {/* 1. Subcategories moved here */}
                <SubcategoryList currentSlug={categorySlug} />

                <div className="space-y-8 pt-8 border-t border-border/50">
                  <h3 className="hidden lg:block font-bold text-sm uppercase tracking-widest mb-6 text-charcoal">Bộ Lọc Chi Tiết</h3>
                  
                  <div className="animate-fade-in">
                    <h4 className="font-bold mb-4 text-[11px] uppercase tracking-widest text-muted-foreground">Khoảng Giá</h4>
                    <div className="space-y-2.5">
                      {priceRanges.map((range) => (
                        <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                          <Checkbox checked={filters.priceRange.includes(range.value)} onCheckedChange={() => toggleFilter('priceRange', range.value)} className="border-border/60 data-[state=checked]:bg-primary" />
                          <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fade-in">
                    <h4 className="font-bold mb-4 text-[11px] uppercase tracking-widest text-muted-foreground">Phong Cách</h4>
                    <div className="space-y-2.5">
                      {styles.map((style) => (
                        <label key={style} className="flex items-center gap-3 cursor-pointer group">
                          <Checkbox checked={filters.styles.includes(style)} onCheckedChange={() => toggleFilter('styles', style)} className="border-border/60 data-[state=checked]:bg-primary" />
                          <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fade-in">
                    <h4 className="font-bold mb-4 text-[11px] uppercase tracking-widest text-muted-foreground">Chất Liệu</h4>
                    <div className="space-y-2.5">
                      {materials.map((material) => (
                        <label key={material} className="flex items-center gap-3 cursor-pointer group">
                          <Checkbox checked={filters.materials.includes(material)} onCheckedChange={() => toggleFilter('materials', material)} className="border-border/60 data-[state=checked]:bg-primary" />
                          <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 text-xs font-bold uppercase tracking-widest h-11" onClick={clearFilters}>
                    Thiết lập lại tất cả
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Products Content */}
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-charcoal">{category.title}</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">{category.description}</p>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="lg:hidden h-9 px-4 rounded-xl border-border/60" onClick={() => setShowFilters(!showFilters)}>
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Lọc & Danh Mục
                    </Button>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{products.length} Sản phẩm</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
                      <SelectTrigger className="w-44 h-10 text-xs font-bold uppercase tracking-widest border-border/60 rounded-xl bg-card">
                        <SelectValue placeholder="Sắp xếp" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 shadow-elevated">
                        <SelectItem value="newest" className="text-xs font-medium uppercase tracking-widest">Mới nhất</SelectItem>
                        <SelectItem value="price-asc" className="text-xs font-medium uppercase tracking-widest">Giá tăng dần</SelectItem>
                        <SelectItem value="price-desc" className="text-xs font-medium uppercase tracking-widest">Giá giảm dần</SelectItem>
                        <SelectItem value="popular" className="text-xs font-medium uppercase tracking-widest">Phổ biến nhất</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Lọc theo:</span>
                      {filters.priceRange.map(val => (
                        <Badge key={val} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-lg text-[10px] font-bold">
                          {priceRanges.find(r => r.value === val)?.label}
                          <button onClick={() => toggleFilter('priceRange', val)} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                      {filters.styles.map(val => (
                        <Badge key={val} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-lg text-[10px] font-bold">
                          {val}
                          <button onClick={() => toggleFilter('styles', val)} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                      {filters.materials.map(val => (
                        <Badge key={val} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-lg text-[10px] font-bold">
                          {val}
                          <button onClick={() => toggleFilter('materials', val)} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-24 bg-secondary/20 rounded-2xl border border-dashed border-border/60">
                    <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-muted-foreground text-sm">Vui lòng điều chỉnh lại bộ lọc để tìm thấy sản phẩm ưng ý.</p>
                    <Button variant="link" className="mt-4 text-primary font-bold uppercase tracking-widest" onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
                  </div>
                ) : (
                  products.map((product, index) => {
                    const isFavorite = isInWishlist(product.id);
                    return (
                      <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                        <div className="group card-luxury relative h-full flex flex-col bg-card">
                          <div className="relative aspect-square img-zoom">
                            <Link to={`/san-pham/${product.id}`} className="block">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                {product.isNew && <span className="bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Mới</span>}
                                {product.isSale && <span className="bg-destructive text-destructive-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Sale</span>}
                              </div>
                            </Link>

                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }} className={`p-2.5 rounded-full shadow-medium transition-all pointer-events-auto ${isFavorite ? 'bg-primary text-primary-foreground' : 'bg-card/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'}`}><Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /></button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ ...product, quantity: 1 }); }} className="p-2.5 bg-card/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-all pointer-events-auto"><ShoppingBag className="w-4 h-4" /></button>
                            </div>

                            <button onClick={() => setSelectedProduct(product)} className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-md text-charcoal p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-primary hover:text-primary-foreground shadow-elevated flex items-center gap-2 border border-border/40">
                              <Eye className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Xem nhanh</span>
                            </button>
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col">
                            <Link to={`/san-pham/${product.id}`}><h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-3 leading-snug">{product.name}</h3></Link>
                            <div className="flex items-center gap-1.5 mb-4"><div className="flex text-primary">{[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'fill-current' : ''}`} />)}</div><span className="text-[10px] font-bold text-muted-foreground">4.5</span></div>
                            <div className="mt-auto"><span className="text-lg font-bold text-charcoal">{formatPrice(product.price)}</span></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
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