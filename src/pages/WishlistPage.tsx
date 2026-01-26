import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, X, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryTvStand from "@/assets/category-tv-stand.jpg";

interface WishlistItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

const initialWishlist: WishlistItem[] = [
  { id: 1, name: "Sofa Góc Chữ L Vải Nhung Cao Cấp", image: categorySofa, price: 45990000, inStock: true },
  { id: 2, name: "Bàn Ăn Mặt Đá Sintered Stone 6 Ghế", image: categoryDiningTable, price: 32990000, originalPrice: 38990000, inStock: true },
  { id: 3, name: "Giường Ngủ Bọc Da Ý Cao Cấp", image: categoryBed, price: 38990000, inStock: false },
  { id: 4, name: "Kệ Tivi Gỗ Óc Chó Phong Cách Nhật", image: categoryTvStand, price: 25990000, inStock: true },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);

  const removeItem = (id: number) => {
    setWishlist(items => items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setWishlist([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Sản Phẩm Yêu Thích ({wishlist.length})</h1>
            {wishlist.length > 0 && (
              <Button variant="outline" onClick={clearAll} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {wishlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="w-20 h-20 mx-auto text-muted-foreground/50 mb-6" />
              <h2 className="text-xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h2>
              <p className="text-muted-foreground mb-6">Hãy thêm những sản phẩm bạn yêu thích để dễ dàng theo dõi</p>
              <Button asChild>
                <Link to="/phong-khach">Khám Phá Sản Phẩm</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group card-luxury relative"
                >
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <Link to={`/san-pham/${item.id}`}>
                    <div className="relative aspect-square img-zoom">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                          <span className="bg-card text-foreground px-4 py-2 text-sm font-medium rounded">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/san-pham/${item.id}`}>
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {item.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      size="sm"
                      disabled={!item.inStock}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {item.inStock ? "Thêm vào giỏ" : "Hết hàng"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
