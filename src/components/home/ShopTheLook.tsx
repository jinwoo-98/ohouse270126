import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingBag, ChevronRight, Check, Truck, Shield, ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

const looks = [
  {
    id: 1,
    title: "Phòng Khách Hiện Đại",
    room: "Phòng Khách",
    mainImage: heroLivingRoom,
    products: [
      { 
        id: 2, 
        name: "Sofa Góc Chữ L Vải Nhung", 
        image: categorySofa, 
        price: 45990000, 
        originalPrice: 52000000,
        category: "Sofa",
        description: "Sofa cao cấp với chất liệu vải nhung nhập khẩu, khung gỗ sồi tự nhiên mang lại sự sang trọng và êm ái tuyệt đối cho phòng khách của bạn.",
        features: ["Khung gỗ sồi bền bỉ", "Vải nhung kháng khuẩn", "Đệm mút 4 lớp", "Kích thước: 280x160cm"],
        href: "/san-pham/2", 
        x: 50, 
        y: 65 
      },
      { 
        id: 4, 
        name: "Bàn Trà Tròn Mặt Kính", 
        image: categoryCoffeeTable, 
        price: 12990000, 
        category: "Bàn Trà",
        description: "Thiết kế tối giản với mặt kính cường lực và chân inox mạ titan vàng gương.",
        features: ["Kính cường lực 12mm", "Chân inox 304", "Chống trầy xước", "Dễ dàng vệ sinh"],
        href: "/san-pham/4", 
        x: 30, 
        y: 75 
      },
      { 
        id: 12, 
        name: "Đèn Sàn Trang Trí", 
        image: categoryDiningTable, 
        price: 6990000, 
        category: "Đèn",
        description: "Ánh sáng vàng ấm áp tạo điểm nhấn tinh tế cho không gian đọc sách.",
        features: ["Thân kim loại sơn tĩnh điện", "Điều chỉnh độ sáng", "Tiết kiệm điện"],
        href: "/san-pham/12", 
        x: 80, 
        y: 40 
      },
    ],
  },
  {
    id: 2,
    title: "Phòng Ăn Sang Trọng",
    room: "Phòng Ăn",
    mainImage: heroDiningRoom,
    products: [
      { 
        id: 3, 
        name: "Bàn Ăn Mặt Đá Marble", 
        image: categoryDiningTable, 
        price: 32990000, 
        originalPrice: 38990000, 
        category: "Bàn Ăn",
        description: "Mặt đá Marble tự nhiên vân mây kết hợp chân gỗ óc chó cao cấp.",
        features: ["Đá Marble tự nhiên", "Chân gỗ óc chó", "Ghế bọc da Microfiber"],
        href: "/san-pham/3", 
        x: 50, 
        y: 60 
      },
      { 
        id: 10, 
        name: "Ghế Ăn Bọc Da", 
        image: categorySofa, 
        price: 42990000, 
        category: "Ghế Ăn",
        description: "Ghế ăn bọc da cao cấp, thiết kế hiện đại, dễ dàng vệ sinh.",
        features: ["Da Microfiber", "Khung thép không gỉ", "Màu sắc đa dạng"],
        href: "/san-pham/10", 
        x: 25, 
        y: 65 
      },
      { 
        id: 7, 
        name: "Đèn Chùm Pha Lê", 
        image: categoryBed, 
        price: 15990000, 
        category: "Đèn",
        description: "Đèn chùm pha lê lấp lánh, tạo điểm nhấn sang trọng cho phòng ăn.",
        features: ["Pha lê K9", "Khung kim loại mạ vàng", "Tiết kiệm điện"],
        href: "/san-pham/7", 
        x: 50, 
        y: 20 
      },
    ],
  },
  {
    id: 3,
    title: "Phòng Ngủ Tối Giản",
    room: "Phòng Ngủ",
    mainImage: heroBedroom,
    products: [
      { 
        id: 6, 
        name: "Giường Ngủ Bọc Da Ý", 
        image: categoryBed, 
        price: 38990000, 
        category: "Giường",
        description: "Giường ngủ bọc da bò thật nhập khẩu từ Ý, thiết kế chuẩn ergonomic.",
        features: ["Da bò thật 100%", "Khung thép chịu lực", "Giát giường cong"],
        href: "/san-pham/6", 
        x: 50, 
        y: 60 
      },
      { 
        id: 14, 
        name: "Tủ Quần Áo Gỗ Sồi", 
        image: categorySofa, 
        price: 22000000, 
        category: "Tủ Quần Áo",
        description: "Tủ quần áo gỗ sồi tự nhiên, thiết kế 4 cánh mở, không gian lưu trữ lớn.",
        features: ["Gỗ Sồi tự nhiên", "Chống mối mọt", "Bảo hành 5 năm"],
        href: "/san-pham/14", 
        x: 85, 
        y: 40 
      },
    ],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ShopTheLook() {
  const [activeLookId, setActiveLookId] = useState(looks[0].id);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const activeLookIndex = looks.findIndex(look => look.id === activeLookId);
  const activeLook = looks[activeLookIndex];
  const selectedProduct = activeLook.products.find(p => p.id === selectedProductId);

  const goToPrev = () => {
    const newIndex = (activeLookIndex - 1 + looks.length) % looks.length;
    setActiveLookId(looks[newIndex].id);
    setSelectedProductId(null);
  };

  const goToNext = () => {
    const newIndex = (activeLookIndex + 1) % looks.length;
    setActiveLookId(looks[newIndex].id);
    setSelectedProductId(null);
  };

  const handleRoomChange = (roomName: string) => {
    const look = looks.find(l => l.room === roomName);
    if (look) {
      setActiveLookId(look.id);
      setSelectedProductId(null);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/20 overflow-hidden">
      <div className="container-luxury">
        <div className="text-center mb-10">
          <h2 className="section-title mb-4">Shop The Look</h2>
          <p className="text-muted-foreground">Mua sắm trực tiếp từ những không gian thiết kế ấn tượng</p>
        </div>

        {/* Main Interactive Image Area */}
        <div className="relative rounded-lg overflow-hidden bg-background shadow-elevated">
          
          {/* Room Tabs Navigation */}
          <div className="absolute top-0 left-0 right-0 z-30 bg-card/90 backdrop-blur-sm p-3 flex justify-center gap-4 border-b border-border">
            {looks.map(look => (
              <button
                key={look.id}
                onClick={() => handleRoomChange(look.room)}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                  look.id === activeLookId 
                    ? 'bg-primary text-primary-foreground shadow-gold' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {look.room}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[16/9] md:aspect-[21/9] w-full pt-[60px] md:pt-[70px]" // Add padding for tabs
            >
              <img
                src={activeLook.mainImage}
                alt={activeLook.title}
                className="w-full h-full object-cover absolute inset-0 top-[60px] md:top-[70px]"
              />
              
              {/* Hotspots Overlay */}
              <div className="absolute inset-0 top-[60px] md:top-[70px] bg-black/5">
                {activeLook.products.map((product) => (
                  <TooltipProvider key={product.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedProductId(selectedProductId === product.id ? null : product.id)}
                          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-primary hover:scale-110 hover:bg-white transition-all duration-300 z-10 group"
                          style={{ left: `${product.x}%`, top: `${product.y}%` }}
                        >
                          <span className="absolute w-full h-full rounded-full bg-white/50 animate-ping opacity-75 group-hover:hidden"></span>
                          <Plus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-charcoal text-cream border-charcoal p-3 shadow-medium">
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-primary font-bold text-xs mt-1">{formatPrice(product.price)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-card/30 backdrop-blur-sm rounded-full text-cream hover:bg-primary hover:text-primary-foreground transition-all z-20"
                aria-label="Previous look"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-card/30 backdrop-blur-sm rounded-full text-cream hover:bg-primary hover:text-primary-foreground transition-all z-20"
                aria-label="Next look"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Product Detail Sidebar (Sheet) */}
          <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
            <SheetContent className="w-full sm:max-w-[450px] p-0 overflow-y-auto">
              {selectedProduct && (
                <div className="flex flex-col h-full">
                  <div className="relative aspect-square">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest">
                        {selectedProduct.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    <SheetHeader className="space-y-2">
                      <SheetTitle className="text-2xl font-bold leading-tight">
                        {selectedProduct.name}
                      </SheetTitle>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        {selectedProduct.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            {formatPrice(selectedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                    </SheetHeader>

                    <SheetDescription className="text-base text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </SheetDescription>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider">Đặc điểm nổi bật</h4>
                      <ul className="space-y-3">
                        {selectedProduct.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                      <div className="flex flex-col items-center text-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        <span className="text-[10px] uppercase font-bold">Giao nhanh 24h</span>
                      </div>
                      <div className="flex flex-col items-center text-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-[10px] uppercase font-bold">Bảo hành 2 năm</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button className="w-full btn-hero h-14 text-base">
                        <ShoppingBag className="w-5 h-5 mr-3" />
                        Thêm Vào Giỏ Hàng
                      </Button>
                      <Button variant="outline" className="w-full h-14 text-base" asChild>
                        <Link to={selectedProduct.href}>
                          Xem Trang Chi Tiết
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
}