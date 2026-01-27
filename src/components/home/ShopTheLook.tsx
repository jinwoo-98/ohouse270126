import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingBag, ChevronRight, Check, Truck, Shield, ChevronLeft, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import heroBathroom from "@/assets/hero-bathroom.jpg"; 
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";

const looksData = [
  {
    id: 1,
    room: "Phòng Khách",
    images: [
      { 
        src: heroLivingRoom, 
        title: "Phòng Khách Hiện Đại",
        products: [
          { 
            id: 2, 
            name: "Sofa Góc Chữ L Vải Nhung", 
            image: categorySofa, 
            price: 45990000, 
            originalPrice: 52000000,
            category: "Sofa",
            description: "Sofa cao cấp with chất liệu vải nhung nhập khẩu, khung gỗ sồi tự nhiên mang lại sự sang trọng và êm ái tuyệt đối cho phòng khách của bạn.",
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
            description: "Thiết kế tối giản with mặt kính cường lực and chân inox mạ titan vàng gương.",
            features: ["Kính cường lực 12mm", "Chân inox 304", "Chống trầy xước", "Dễ dàng vệ sinh"],
            href: "/san-pham/4", 
            x: 30, 
            y: 75 
          },
        ],
      },
      { 
        src: categoryTvStand, 
        title: "Góc Giải Trí Tinh Tế",
        products: [
          { 
            id: 1, 
            name: "Kệ Tivi Gỗ Óc Chó", 
            image: categoryTvStand, 
            price: 25990000, 
            category: "Kệ Tivi",
            description: "Kệ tivi cao cấp kết hợp hoàn hảo giữa gỗ óc chó tự nhiên and mặt đá sintered stone.",
            features: ["Gỗ óc chó tự nhiên", "Đá Sintered Stone", "Kích thước: 180cm"],
            href: "/san-pham/1", 
            x: 50, 
            y: 50 
          },
        ],
      },
    ],
  },
  {
    id: 2,
    room: "Phòng Ăn",
    images: [
      { 
        src: heroDiningRoom, 
        title: "Phòng Ăn Sang Trọng",
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
    ],
  },
  {
    id: 3,
    room: "Phòng Ngủ",
    images: [
      { 
        src: heroBedroom, 
        title: "Phòng Ngủ Tối Giản",
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
        ],
      },
      { 
        src: heroBathroom, 
        title: "Góc Thư Giãn",
        products: [
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
    ],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function ShopTheLook() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [activeLookId, setActiveLookId] = useState(looksData[0].id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const activeLook = looksData.find(look => look.id === activeLookId)!;
  const currentImage = activeLook.images[currentImageIndex];
  const selectedProduct = currentImage.products.find(p => p.id === selectedProductId);

  const handleLookChange = (id: number) => {
    setActiveLookId(id);
    setCurrentImageIndex(0); 
    setSelectedProductId(null);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + activeLook.images.length) % activeLook.images.length);
    setSelectedProductId(null);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % activeLook.images.length);
    setSelectedProductId(null);
  };

  const isMultiImage = activeLook.images.length > 1;

  return (
    <section className="py-10 md:py-24 bg-secondary/20 overflow-hidden">
      <div className="container-luxury">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="section-title mb-2 md:mb-4">Shop The Look</h2>
          <p className="text-muted-foreground text-sm md:text-base">Mua sắm trực tiếp từ những không gian thiết kế ấn tượng</p>
        </div>

        {/* Room Selector Tabs - Scrollable on mobile */}
        <div className="flex justify-start md:justify-center overflow-x-auto gap-3 md:gap-4 mb-6 md:mb-8 pb-2 px-4 no-scrollbar">
          {looksData.map(look => (
            <button
              key={look.id}
              onClick={() => handleLookChange(look.id)}
              className={`px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2 whitespace-nowrap flex-shrink-0 ${
                look.id === activeLookId 
                  ? 'bg-charcoal border-charcoal text-cream shadow-medium scale-105' 
                  : 'bg-transparent border-border text-muted-foreground hover:border-charcoal hover:text-charcoal'
              }`}
            >
              {look.room}
            </button>
          ))}
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-background shadow-elevated border border-border/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeLook.id}-${currentImageIndex}`} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] md:aspect-[3/2] w-full" 
            >
              <img
                src={currentImage.src}
                alt={currentImage.title}
                className="w-full h-full object-cover"
              />
              
              {/* Product Hotspots */}
              <div className="absolute inset-0 bg-black/5">
                {currentImage.products.map((product) => (
                  <TooltipProvider key={product.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedProductId(selectedProductId === product.id ? null : product.id)}
                          className="absolute w-8 h-8 md:w-9 md:h-9 -ml-4 -mt-4 md:-ml-4.5 md:-mt-4.5 rounded-full bg-white/95 shadow-elevated flex items-center justify-center text-primary hover:scale-125 hover:bg-white transition-all duration-300 z-10 group"
                          style={{ left: `${product.x}%`, top: `${product.y}%` }}
                        >
                          <span className="absolute w-full h-full rounded-full bg-white/50 animate-ping opacity-75 group-hover:hidden"></span>
                          <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-charcoal text-cream border-charcoal p-3 shadow-medium hidden md:block">
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-primary font-bold text-xs mt-1">{formatPrice(product.price)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {/* Navigation Arrows */}
              {isMultiImage && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 md:w-10 h-16 md:h-24 bg-card/40 backdrop-blur-md rounded-r-xl text-charcoal hover:bg-primary hover:text-primary-foreground transition-all z-20 shadow-medium flex items-center justify-center"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 md:w-10 h-16 md:h-24 bg-card/40 backdrop-blur-md rounded-l-xl text-charcoal hover:bg-primary hover:text-primary-foreground transition-all z-20 shadow-medium flex items-center justify-center"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
            <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col z-[100]">
              {selectedProduct && (
                <>
                  <div className="flex-1 overflow-y-auto">
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
                      
                      <button 
                        onClick={() => toggleWishlist({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: selectedProduct.price,
                          image: selectedProduct.image,
                          originalPrice: selectedProduct.originalPrice
                        })}
                        className={`absolute top-4 right-14 p-2.5 rounded-full shadow-medium transition-all ${
                          isInWishlist(selectedProduct.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(selectedProduct.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 pb-24">
                      <SheetHeader className="space-y-2">
                        <SheetTitle className="text-xl md:text-2xl font-bold leading-tight text-left">
                          {selectedProduct.name}
                        </SheetTitle>
                        <div className="flex items-center gap-3">
                          <span className="text-xl md:text-2xl font-bold text-primary">
                            {formatPrice(selectedProduct.price)}
                          </span>
                          {selectedProduct.originalPrice && (
                            <span className="text-base md:text-lg text-muted-foreground line-through">
                              {formatPrice(selectedProduct.originalPrice)}
                            </span>
                          )}
                        </div>
                      </SheetHeader>

                      <SheetDescription className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
                        {selectedProduct.description}
                      </SheetDescription>

                      <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-left">Đặc điểm nổi bật</h4>
                        <ul className="space-y-3">
                          {selectedProduct.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <Check className="w-4 h-4 text-primary mt-0.5" />
                              <span className="text-left">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border bg-card sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 h-12 text-sm font-semibold" asChild onClick={() => setSelectedProductId(null)}>
                        <Link to={selectedProduct.href}>
                          Xem Chi Tiết
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button 
                        className="flex-[1.5] btn-hero h-12 text-sm font-bold shadow-gold"
                        onClick={() => addToCart({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: selectedProduct.price,
                          image: selectedProduct.image,
                          quantity: 1
                        })}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Thêm Vào Giỏ
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
}