import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Truck, RefreshCw, Shield, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryDesk from "@/assets/category-desk.jpg";

// Declare placeholder before usage
const categoryLivingRoomPlaceholder = categorySofa;

// Mock database to simulate dynamic product loading
const MOCK_PRODUCTS: Record<string, any> = {
  "1": {
    name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá Sintered Stone",
    price: 25990000,
    originalPrice: 32990000,
    category: "Kệ Tivi",
    image: categoryTvStand,
    images: [categoryTvStand, categorySofa, categoryDiningTable, categoryCoffeeTable],
    description: "Kệ tivi cao cấp kết hợp hoàn hảo giữa gỗ óc chó tự nhiên và mặt đá sintered stone. Thiết kế hiện đại, sang trọng phù hợp với mọi không gian phòng khách.",
    features: ["Chất liệu: Gỗ óc chó + Đá Sintered", "Kích thước: 180cm", "Bảo hành: 2 năm"],
    colors: ["Nâu Óc Chó", "Tự Nhiên"]
  },
  "2": {
    name: "Sofa Góc Chữ L Vải Nhung Ý Cao Cấp",
    price: 45990000,
    originalPrice: 52000000,
    category: "Sofa",
    image: categorySofa,
    images: [categorySofa, categoryLivingRoomPlaceholder, categoryCoffeeTable, categoryDiningTable],
    description: "Sofa cao cấp với chất liệu vải nhung nhập khẩu, khung gỗ sồi tự nhiên mang lại sự sang trọng và êm ái tuyệt đối.",
    features: ["Khung gỗ sồi", "Vải nhung kháng khuẩn", "Đệm mút 4 lớp"],
    colors: ["Xám Chuột", "Xanh Navy", "Be"]
  },
  "3": {
    name: "Bàn Ăn Mặt Đá Marble Chân Gỗ Óc Chó",
    price: 32990000,
    originalPrice: 38990000,
    category: "Bàn Ăn",
    image: categoryDiningTable,
    images: [categoryDiningTable, categoryCoffeeTable, categorySofa, categoryTvStand],
    description: "Mặt đá Marble tự nhiên vân mây kết hợp chân gỗ óc chó cao cấp, tạo điểm nhấn đẳng cấp cho phòng ăn.",
    features: ["Đá Marble tự nhiên", "Chân gỗ óc chó", "Kèm 6 ghế bọc da"],
    colors: ["Trắng Vân Mây", "Đen Tia Chớp"]
  },
  "4": {
    name: "Bàn Trà Tròn Mặt Kính Cường Lực",
    price: 12990000,
    category: "Bàn Trà",
    image: categoryCoffeeTable,
    images: [categoryCoffeeTable, categorySofa, categoryTvStand, categoryDiningTable],
    description: "Thiết kế tối giản với mặt kính cường lực và chân inox mạ titan vàng gương.",
    features: ["Kính cường lực 12mm", "Chân inox 304", "Chống trầy xước"],
    colors: ["Vàng Gương", "Bạc Chrome"]
  },
  "6": {
    name: "Giường Ngủ Bọc Da Ý Khung Inox",
    price: 38990000,
    category: "Giường",
    image: categoryBed,
    images: [categoryBed, categorySofa, categoryDiningTable, categoryDesk],
    description: "Giường ngủ bọc da bò thật nhập khẩu từ Ý, thiết kế chuẩn ergonomic mang lại giấc ngủ sâu.",
    features: ["Da bò thật 100%", "Khung thép chịu lực", "Bảo hành 5 năm"],
    colors: ["Nâu Bò", "Kem", "Đen"]
  },
  "7": {
    name: "Đèn Chùm Pha Lê Luxury Style",
    price: 15990000,
    category: "Đèn",
    image: categoryBed,
    images: [categoryBed, categoryDiningTable, categorySofa, categoryCoffeeTable],
    description: "Đèn chùm pha lê lấp lánh, tạo điểm nhấn sang trọng cho không gian sống đẳng cấp.",
    features: ["Pha lê K9 cao cấp", "Khung kim loại mạ vàng", "Tiết kiệm điện"],
    colors: ["Vàng Gold"]
  },
  "14": {
    name: "Tủ Quần Áo Gỗ Sồi 4 Cánh Hiện Đại",
    price: 22000000,
    category: "Tủ Quần Áo",
    image: categorySofa,
    images: [categorySofa, categoryBed, categoryDesk, categoryDiningTable],
    description: "Tủ quần áo gỗ sồi tự nhiên với không gian lưu trữ rộng rãi và thiết kế thanh lịch.",
    features: ["Gỗ Sồi tự nhiên", "Chống mối mọt", "Ray trượt giảm chấn"],
    colors: ["Sồi Tự Nhiên", "Sồi Trắng"]
  }
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  // Default to first product if ID not found
  const product = MOCK_PRODUCTS[id || "1"] || MOCK_PRODUCTS["1"];
  const productImages = product.images;

  // Scroll to top when the page loads or the ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset state for new product
    setSelectedImage(0);
    setQuantity(1);
    setSelectedColor(0);
  }, [id, pathname]);

  const relatedProducts = [
    { id: 2, name: "Sofa Góc Chữ L Phong Cách Ý", image: categorySofa, price: 45990000 },
    { id: 3, name: "Bàn Trà Đá Marble Cao Cấp", image: categoryCoffeeTable, price: 12990000 },
    { id: 4, name: "Bàn Ăn Đá 6 Ghế", image: categoryDiningTable, price: 32990000 },
  ];

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
              <Link to="/noi-that" className="hover:text-primary transition-colors">Sản phẩm</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <motion.div 
                key={id + selectedImage}
                className="aspect-square bg-secondary rounded-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-muted'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="animate-fade-in">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {product.originalPrice && (
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs font-semibold rounded">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              {/* Color Selection */}
              <div className="mb-6">
                <span className="font-semibold text-sm mb-3 block">Màu sắc: {product.colors[selectedColor]}</span>
                <div className="flex gap-2">
                  {product.colors.map((color: string, idx: number) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(idx)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === idx 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <span className="font-semibold text-sm mb-3 block">Số lượng</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2.5 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <Button size="lg" className="flex-1 btn-hero">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Thêm Vào Giỏ
                </Button>
                <Button size="lg" variant="outline" className="px-4">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* USPs */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <span className="text-xs">Miễn phí ship</span>
                </div>
                <div className="text-center">
                  <RefreshCw className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <span className="text-xs">Đổi trả 30 ngày</span>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <span className="text-xs">Bảo hành 2 năm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="features" className="mt-12">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger value="features" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                Đặc điểm
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                Thông số
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                Đánh giá
              </TabsTrigger>
            </TabsList>
            <TabsContent value="features" className="pt-6">
              <ul className="space-y-3">
                {product.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="specs" className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <span className="text-sm text-muted-foreground">Chất liệu</span>
                  <p className="font-semibold">{product.category}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <span className="text-sm text-muted-foreground">Xuất xứ</span>
                  <p className="font-semibold">Nhập khẩu Ý</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <span className="text-sm text-muted-foreground">Bảo hành</span>
                  <p className="font-semibold">2 năm</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Sản Phẩm Liên Quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <Link key={item.id} to={`/san-pham/${item.id}`} className="group card-luxury">
                  <div className="aspect-square img-zoom">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {item.name}
                    </h3>
                    <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}