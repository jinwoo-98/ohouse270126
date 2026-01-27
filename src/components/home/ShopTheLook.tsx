import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

// Adding X and Y coordinates (percentages) for hotspots
const looks = [
  {
    id: 1,
    title: "Không Gian Sống Hiện Đại",
    mainImage: heroLivingRoom,
    thumbnailImage: heroLivingRoom,
    products: [
      { id: 2, name: "Sofa Góc Chữ L Vải Nhung", image: categorySofa, price: 45990000, href: "/san-pham/2", x: 50, y: 65 },
      { id: 4, name: "Bàn Trà Tròn Mặt Kính", image: categoryCoffeeTable, price: 12990000, href: "/san-pham/4", x: 30, y: 75 },
      { id: 12, name: "Đèn Sàn Trang Trí", image: categoryDiningTable, price: 6990000, href: "/san-pham/12", x: 80, y: 40 },
    ],
  },
  {
    id: 2,
    title: "Phòng Ăn Sang Trọng",
    mainImage: heroDiningRoom,
    thumbnailImage: heroDiningRoom,
    products: [
      { id: 3, name: "Bàn Ăn Mặt Đá Marble", image: categoryDiningTable, price: 32990000, originalPrice: 38990000, href: "/san-pham/3", x: 50, y: 60 },
      { id: 10, name: "Ghế Ăn Bọc Da", image: categorySofa, price: 42990000, href: "/san-pham/10", x: 25, y: 65 },
      { id: 7, name: "Đèn Chùm Pha Lê", image: categoryBed, price: 15990000, href: "/san-pham/7", x: 50, y: 20 },
    ],
  },
  {
    id: 3,
    title: "Phòng Ngủ Tối Giản",
    mainImage: heroBedroom,
    thumbnailImage: heroBedroom,
    products: [
      { id: 6, name: "Giường Ngủ Bọc Da Ý", image: categoryBed, price: 38990000, href: "/san-pham/6", x: 50, y: 60 },
      { id: 14, name: "Tủ Quần Áo Gỗ Sồi", image: categorySofa, price: 22000000, href: "/san-pham/14", x: 85, y: 40 },
    ],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ShopTheLook() {
  const [activeLookId, setActiveLookId] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const activeLook = looks.find(look => look.id === activeLookId)!;
  const selectedProduct = activeLook.products.find(p => p.id === selectedProductId);

  const handleLookChange = (id: number) => {
    setActiveLookId(id);
    setSelectedProductId(null); // Reset selection when changing looks
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/20">
      <div className="container-luxury">
        <div className="text-center mb-10">
          <h2 className="section-title mb-4">Shop The Look</h2>
          <p className="text-muted-foreground">Mua sắm trực tiếp từ những không gian thiết kế ấn tượng</p>
        </div>

        {/* Main Interactive Image Area */}
        <div className="relative rounded-lg overflow-hidden bg-background shadow-elevated">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[16/9] md:aspect-[21/9] w-full"
            >
              <img
                src={activeLook.mainImage}
                alt={activeLook.title}
                className="w-full h-full object-cover"
              />
              
              {/* Hotspots Overlay */}
              <div className="absolute inset-0 bg-black/5">
                {activeLook.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(selectedProductId === product.id ? null : product.id)}
                    className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-primary hover:scale-110 hover:bg-white transition-all duration-300 z-10 group"
                    style={{ left: `${product.x}%`, top: `${product.y}%` }}
                  >
                    <span className="absolute w-full h-full rounded-full bg-white/50 animate-ping opacity-75 group-hover:hidden"></span>
                    {selectedProductId === product.id ? (
                      <div className="w-3 h-3 bg-primary rounded-full" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Product Detail Sidebar (Floating on the right) */}
          <AnimatePresence>
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 bottom-4 w-72 md:w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-5 z-20 flex flex-col border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg pr-4">{activeLook.title}</h3>
                  <button 
                    onClick={() => setSelectedProductId(null)}
                    className="text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-secondary">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <Link to={selectedProduct.href} className="group">
                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                      {selectedProduct.name}
                    </h4>
                  </Link>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full btn-hero">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Thêm Vào Giỏ
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={selectedProduct.href}>
                        Xem Chi Tiết
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Look Thumbnails Navigation */}
        <div className="mt-8 flex justify-center">
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {looks.map((look) => (
              <button
                key={look.id}
                onClick={() => handleLookChange(look.id)}
                className={`relative w-24 h-24 md:w-32 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  activeLookId === look.id 
                    ? 'border-primary scale-105 shadow-gold' 
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img 
                  src={look.thumbnailImage} 
                  alt={look.title} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}