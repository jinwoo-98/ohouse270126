import { useState } from "react";
import { Link } from "react-router-dom";
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

const productImages = [categoryTvStand, categorySofa, categoryDiningTable, categoryCoffeeTable];

const product = {
  name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá Sintered Stone",
  price: 25990000,
  originalPrice: 32990000,
  sku: "OHOUSE-TV-001",
  category: "Kệ Tivi",
  description: "Kệ tivi cao cấp kết hợp hoàn hảo giữa gỗ óc chó tự nhiên và mặt đá sintered stone. Thiết kế hiện đại, sang trọng phù hợp với mọi không gian phòng khách.",
  features: [
    "Chất liệu: Gỗ óc chó tự nhiên + Đá Sintered Stone",
    "Kích thước: 180cm x 40cm x 50cm",
    "Màu sắc: Nâu óc chó + Trắng vân mây",
    "Xuất xứ: Nhập khẩu từ Ý",
    "Bảo hành: 2 năm",
  ],
  colors: ["Nâu Óc Chó", "Gỗ Tự Nhiên", "Đen Than"],
};

const relatedProducts = [
  { id: 2, name: "Sofa Góc Chữ L Phong Cách Ý", image: categorySofa, price: 45990000 },
  { id: 3, name: "Bàn Trà Đá Marble Cao Cấp", image: categoryCoffeeTable, price: 12990000 },
  { id: 4, name: "Bàn Ăn Đá 6 Ghế", image: categoryDiningTable, price: 32990000 },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

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
              <Link to="/ke-tivi" className="hover:text-primary transition-colors">Kệ Tivi</Link>
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
                {productImages.map((img, idx) => (
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
            <div>
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
                  {product.colors.map((color, idx) => (
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
                {product.features.map((feature, idx) => (
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
                  <span className="text-sm text-muted-foreground">Kích thước</span>
                  <p className="font-semibold">180cm x 40cm x 50cm</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <span className="text-sm text-muted-foreground">Chất liệu</span>
                  <p className="font-semibold">Gỗ Óc Chó + Đá Sintered</p>
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
