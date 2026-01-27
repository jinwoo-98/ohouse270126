import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

const featuredProducts = [
  { id: 1, name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá Sintered Stone", image: categoryTvStand, price: 25990000, category: "Kệ Tivi", isNew: true, href: "/san-pham/1" },
  { id: 2, name: "Sofa Góc Chữ L Phong Cách Ý", image: categorySofa, price: 45990000, category: "Sofa", isNew: false, href: "/san-pham/2" },
  { id: 3, name: "Bàn Ăn Mặt Đá Chân Inox Mạ Vàng", image: categoryDiningTable, price: 32990000, category: "Bàn Ăn", isNew: true, href: "/san-pham/3" },
  { id: 4, name: "Bàn Trà Tròn Mặt Đá Granite", image: categoryCoffeeTable, price: 12990000, category: "Bàn Trà", isNew: false, href: "/san-pham/4" },
  { id: 5, name: "Bàn Làm Việc Gỗ Óc Chó Nguyên Khối", image: categoryDesk, price: 18990000, category: "Bàn Làm Việc", isNew: true, href: "/san-pham/5" },
  { id: 6, name: "Giường Ngủ Bọc Da Ý Khung Inox", image: categoryBed, price: 38990000, category: "Giường", isNew: false, href: "/san-pham/6" },
  { id: 7, name: "Đèn Chùm Pha Lê Luxury", image: categoryLighting, price: 15990000, category: "Đèn Trang Trí", isNew: true, href: "/san-pham/7" },
  { id: 8, name: "Bàn Trà Gỗ Sồi Phong Cách Bắc Âu", image: categoryCoffeeTable, price: 8990000, category: "Bàn Trà", isNew: false, href: "/san-pham/8" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function FeaturedProducts() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <section className="py-10 md:py-24 bg-secondary/30">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="section-title mb-2">Sản Phẩm Nổi Bật</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">Những thiết kế được yêu thích nhất</p>
          <Button variant="outline" asChild className="mt-4 md:mt-6">
            <Link to="/noi-that" className="group">
              Xem Tất Cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {featuredProducts.map((product, index) => {
            const isFavorite = isInWishlist(product.id);
            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }} viewport={{ once: true }}>
                <div className="group card-luxury relative">
                  <div className="relative aspect-square img-zoom">
                    <Link to={product.href} className="block">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      {product.isNew && (
                        <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary text-primary-foreground px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Mới</span>
                      )}
                    </Link>

                    {/* Interaction Buttons - Always visible on mobile (opacity-100), hover on desktop */}
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10 pointer-events-auto">
                      <button onClick={() => toggleWishlist(product)} className={`p-2 md:p-2.5 rounded-full shadow-medium transition-colors ${isFavorite ? 'bg-primary text-primary-foreground' : 'bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'}`}>
                        <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => addToCart({ ...product, quantity: 1 })} className="p-2 md:p-2.5 bg-card/80 backdrop-blur-sm rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                        <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>

                    {/* Quick View Button - Hidden on Mobile to avoid clutter, visible on Desktop hover */}
                    <button onClick={() => setSelectedProduct(product)} className="hidden lg:flex absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-foreground p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-primary hover:text-primary-foreground shadow-sm items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Xem nhanh</span>
                    </button>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
                    <Link to={product.href}><h3 className="font-medium text-xs md:text-sm lg:text-base line-clamp-2 mt-1 group-hover:text-primary transition-colors">{product.name}</h3></Link>
                    <p className="text-sm md:text-lg font-bold text-primary mt-1 md:mt-2">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <QuickViewSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}