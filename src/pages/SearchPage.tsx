import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Search, Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const { products, isLoading, updateFilters } = useProducts("noi-that", query);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-secondary/30 rounded-lg">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm nào</h2>
              <p className="text-muted-foreground mt-2">Hãy thử sử dụng các từ khóa khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const isFavorite = isInWishlist(product.id);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="group card-luxury relative">
                      <Link to={`/san-pham/${product.id}`} className="block">
                        <div className="relative aspect-square img-zoom">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                      
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <button 
                          onClick={() => toggleWishlist({ ...product })}
                          className={`p-2.5 rounded-full shadow-medium transition-all pointer-events-auto ${isFavorite ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-primary hover:text-primary-foreground'}`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={() => addToCart({ ...product, quantity: 1 })}
                          className="p-2.5 bg-card rounded-full shadow-medium hover:bg-primary hover:text-primary-foreground transition-all pointer-events-auto"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <Link to={`/san-pham/${product.id}`}>
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">{product.name}</h3>
                        </Link>
                        <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}