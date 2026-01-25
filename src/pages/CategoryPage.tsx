import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, SlidersHorizontal, Grid3X3, LayoutGrid, Heart, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

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
};

const products = [
  { id: 1, name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá", image: categoryTvStand, price: 25990000, originalPrice: 32990000, isNew: true, isSale: true },
  { id: 2, name: "Sofa Góc Chữ L Vải Nhung Ý", image: categorySofa, price: 45990000, isNew: true },
  { id: 3, name: "Bàn Ăn Mặt Đá Marble 6 Ghế", image: categoryDiningTable, price: 32990000, originalPrice: 38990000, isSale: true },
  { id: 4, name: "Bàn Trà Tròn Mặt Kính Cường Lực", image: categoryCoffeeTable, price: 12990000 },
  { id: 5, name: "Bàn Làm Việc Gỗ Sồi Tự Nhiên", image: categoryDesk, price: 18990000, isNew: true },
  { id: 6, name: "Giường Ngủ Bọc Da Ý Cao Cấp", image: categoryBed, price: 38990000, originalPrice: 45990000, isSale: true },
  { id: 7, name: "Đèn Chùm Pha Lê Phong Cách Châu Âu", image: categoryLighting, price: 15990000 },
  { id: 8, name: "Sofa Đơn Bọc Da Thật", image: categorySofa, price: 19990000, isNew: true },
  { id: 9, name: "Kệ Tivi Treo Tường Hiện Đại", image: categoryTvStand, price: 14990000 },
  { id: 10, name: "Bàn Ăn Gỗ Óc Chó 8 Ghế", image: categoryDiningTable, price: 42990000, originalPrice: 52990000, isSale: true },
  { id: 11, name: "Bàn Trà Gỗ Tần Bì Bắc Âu", image: categoryCoffeeTable, price: 8990000 },
  { id: 12, name: "Đèn Sàn Trang Trí Phòng Khách", image: categoryLighting, price: 6990000, isNew: true },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

const priceRanges = [
  { label: "Dưới 10 triệu", value: "0-10" },
  { label: "10 - 20 triệu", value: "10-20" },
  { label: "20 - 50 triệu", value: "20-50" },
  { label: "Trên 50 triệu", value: "50+" },
];

const materials = ["Gỗ Óc Chó", "Gỗ Sồi", "Đá Marble", "Da Thật", "Vải Nhung", "Inox Mạ Vàng"];

export default function CategoryPage() {
  const { slug } = useParams();
  const [gridCols, setGridCols] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  
  const category = categoryInfo[slug || ""] || { title: "Danh Mục", description: "Khám phá sản phẩm" };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{category.title}</span>
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className="container-luxury py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.title}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>

        <div className="container-luxury pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-card rounded-lg p-5 shadow-subtle sticky top-24">
                <h3 className="font-bold text-lg mb-4">Bộ Lọc</h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Khoảng Giá</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Chất Liệu</h4>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <label key={material} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox />
                        <span className="text-sm">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full">Xóa Bộ Lọc</Button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Lọc
                  </Button>
                  <span className="text-sm text-muted-foreground">{products.length} sản phẩm</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-1">
                    <button 
                      onClick={() => setGridCols(3)}
                      className={`p-2 rounded ${gridCols === 3 ? 'bg-secondary' : 'hover:bg-secondary'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setGridCols(4)}
                      className={`p-2 rounded ${gridCols === 4 ? 'bg-secondary' : 'hover:bg-secondary'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-40 h-9 text-sm">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                      <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                      <SelectItem value="popular">Phổ biến nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products */}
              <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 md:gap-5`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div className="group card-luxury">
                      <Link to={`/san-pham/${product.id}`}>
                        <div className="relative aspect-square img-zoom">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                              <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold">
                                Mới
                              </span>
                            )}
                            {product.isSale && (
                              <span className="bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-semibold">
                                Sale
                              </span>
                            )}
                          </div>
                          
                          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button className="p-2.5 bg-card rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="p-2.5 bg-card rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                              <ShoppingBag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="p-3">
                        <Link to={`/san-pham/${product.id}`}>
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
