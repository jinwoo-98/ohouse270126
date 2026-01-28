import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, Heart, ShoppingBag, X, Eye, Star, Percent, LayoutGrid, ListFilter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { SubcategoryList } from "@/components/category/SubcategoryList";
import { cn } from "@/lib/utils";

const categoryInfo: Record<string, { title: string; description: string; parent?: string }> = {
  // Main
  "phong-khach": { title: "Phòng Khách", description: "Nội thất phòng khách sang trọng" },
  "phong-ngu": { title: "Phòng Ngủ", description: "Giường ngủ và tủ quần áo cao cấp" },
  "phong-an": { title: "Phòng Ăn", description: "Bàn ăn và ghế ăn tinh tế" },
  "phong-tam": { title: "Phòng Tắm", description: "Thiết bị vệ sinh cao cấp" },
  "phong-lam-viec": { title: "Văn Phòng", description: "Bàn làm việc hiện đại" },
  "den-trang-tri": { title: "Đèn Trang Trí", description: "Ánh sáng hoàn mỹ" },
  "decor": { title: "Decor", description: "Phụ kiện trang trí" },
  "ban-ghe": { title: "Bàn & Ghế", description: "Bộ sưu tập bàn ghế" },
  "noi-that": { title: "Tất Cả Nội Thất", description: "Khám phá toàn bộ bộ sưu tập" },
  "sale": { title: "Khuyến Mãi", description: "Sản phẩm ưu đãi đặc biệt" },
  "ban-chay": { title: "Bán Chạy", description: "Top sản phẩm được yêu thích" },
  "moi": { title: "Sản Phẩm Mới", description: "Bộ sưu tập mới nhất" },
  
  // Sub
  "sofa": { title: "Sofa & Ghế", description: "Sofa góc, sofa văng", parent: "phong-khach" },
  "ban-tra": { title: "Bàn Trà", description: "Bàn trà đá, gỗ", parent: "phong-khach" },
  "ke-tivi": { title: "Kệ Tivi", description: "Kệ tivi gỗ óc chó", parent: "phong-khach" },
  "den-san": { title: "Đèn Sàn", description: "Đèn sàn hiện đại", parent: "phong-khach" },
  "tu-trang-tri": { title: "Tủ Trang Trí", description: "Tủ kệ decor", parent: "phong-khach" },
  "giuong": { title: "Giường Ngủ", description: "Giường bọc da", parent: "phong-ngu" },
  "tu-quan-ao": { title: "Tủ Quần Áo", description: "Tủ gỗ sồi", parent: "phong-ngu" },
  "ban-trang-diem": { title: "Bàn Trang Điểm", description: "Góc làm đẹp", parent: "phong-ngu" },
  "den-ngu": { title: "Đèn Ngủ", description: "Ánh sáng thư giãn", parent: "phong-ngu" },
  "ban-an": { title: "Bàn Ăn", description: "Bàn ăn hiện đại", parent: "phong-an" },
  "ghe-an": { title: "Ghế Ăn", description: "Ghế ăn bọc da", parent: "phong-an" },
  "tu-ruou": { title: "Tủ Rượu", description: "Không gian trưng bày", parent: "phong-an" },
  "den-chum": { title: "Đèn Chùm", description: "Ánh sáng sang trọng", parent: "phong-an" },
  "ghe-thu-gian": { title: "Ghế Thư Giãn", description: "Tận hưởng không gian", parent: "ban-ghe" },
  "ban-lam-viec": { title: "Bàn Làm Việc", description: "Cảm hứng sáng tạo", parent: "phong-lam-viec" },
  "ban-console": { title: "Bàn Console", description: "Điểm nhấn hành lang", parent: "ban-ghe" },
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

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const category = categoryInfo[categorySlug] || { title: "Danh Mục", description: "Khám phá sản phẩm" };
  const parentCategory = category.parent ? categoryInfo[category.parent] : null;
  const hasActiveFilters = filters.priceRange.length > 0 || filters.materials.length > 0 || filters.styles.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="bg-secondary/30 py-3">
          <div className="container-luxury !max-w-[1600px]">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              {parentCategory && (
                <>
                  <Link to={`/${category.parent}`} className="hover:text-primary transition-colors">{parentCategory.title}</Link>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              <span className="text-foreground">{category.title}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-6 md:py-8 !max-w-[1600px] !px-4 md:!px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className={cn("hidden lg:block transition-all duration-500 overflow-hidden", isSidebarVisible ? "w-72 opacity-100 mr-4" : "w-0 opacity-0 mr-0")}>
              <div className="w-72 sticky top-28 space-y-8">
                <SubcategoryList currentSlug={categorySlug} />
                <div className="space-y-8 pt-8 border-t border-border/50">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-charcoal">Bộ Lọc Chi Tiết</h3>
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
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 text-xs font-bold uppercase tracking-widest h-11" onClick={clearFilters}>Thiết lập lại</Button>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md py-4 border-b border-border/60 mb-8 -mx-4 px-4 md:-mx-8 md:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-4">
                      <h1 className="hidden md:block text-sm font-bold uppercase tracking-[0.2em] text-charcoal whitespace-nowrap">{category.title}</h1>
                      <div className="h-4 w-[1px] bg-border/50 hidden md:block" />
                      <Button variant="ghost" size="sm" onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="hidden lg:flex h-10 px-3 rounded-xl hover:bg-secondary gap-2 text-xs font-bold uppercase tracking-widest">
                        {isSidebarVisible ? <X className="w-4 h-4" /> : <ListFilter className="w-4 h-4" />}
                        {isSidebarVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowFiltersMobile(true)} className="lg:hidden h-10 px-4 rounded-xl border-border/60 gap-2"><SlidersHorizontal className="w-4 h-4" /> Lọc</Button>
                    </div>
                    <div className="h-6 w-[1px] bg-border/50 mx-1 hidden lg:block" />
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border/40 hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => updateFilters({ saleOnly: !filters.saleOnly })}>
                      <div className={cn("p-1.5 rounded-lg transition-colors", filters.saleOnly ? "bg-destructive text-white" : "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white")}><Percent className="w-3.5 h-3.5" /></div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/80 hidden sm:block">Giảm giá</span>
                      <Switch checked={filters.saleOnly} onCheckedChange={(val) => updateFilters({ saleOnly: val })} onClick={(e) => e.stopPropagation()} className="scale-75 data-[state=checked]:bg-destructive" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">{products.length} Sản phẩm</span>
                    <Select value={filters.sortBy} onValueChange={(val: any) => updateFilters({ sortBy: val })}>
                      <SelectTrigger className="w-36 md:w-44 h-10 text-xs font-bold uppercase tracking-widest border-border/60 rounded-xl bg-card">
                        <SelectValue placeholder="Sắp xếp" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 shadow-elevated">
                        <SelectItem value="newest" className="text-xs font-medium uppercase tracking-widest">Mới nhất</SelectItem>
                        <SelectItem value="price-asc" className="text-xs font-medium uppercase tracking-widest">Giá tăng dần</SelectItem>
                        <SelectItem value="price-desc" className="text-xs font-medium uppercase tracking-widest">Giá giảm dần</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className={cn("grid grid-cols-2 gap-4 md:gap-6 lg:gap-8", isSidebarVisible ? "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5")}>
                {isLoading ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.map((product, index) => {
                  const isFavorite = isInWishlist(product.id);
                  return (
                    <motion.div key={`${product.id}-${isSidebarVisible}`} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.03 }}>
                      <div className="group card-luxury relative h-full flex flex-col bg-card border border-border/40">
                        <div className="relative aspect-square img-zoom">
                          <Link to={`/san-pham/${product.id}`} className="block">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              {product.isNew && <span className="bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Mới</span>}
                              {product.isSale && <span className="bg-destructive text-destructive-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Sale</span>}
                            </div>
                          </Link>
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }} className={`p-2.5 rounded-full shadow-medium transition-all pointer-events-auto ${isFavorite ? 'bg-primary text-primary-foreground' : 'bg-card/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'}`}><Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /></button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ ...product, quantity: 1 }); }} className="p-2.5 bg-card/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-all pointer-events-auto"><ShoppingBag className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => setSelectedProduct(product)} className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-md text-charcoal py-2.5 rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all z-10 hover:bg-primary hover:text-primary-foreground shadow-elevated flex items-center justify-center gap-2 border border-border/40"><Eye className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Xem nhanh</span></button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <Link to={`/san-pham/${product.id}`}><h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-3 leading-snug h-10">{product.name}</h3></Link>
                          <div className="mt-auto flex flex-col">
                            <span className="text-lg font-bold text-charcoal">{formatPrice(product.price)}</span>
                            {product.originalPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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