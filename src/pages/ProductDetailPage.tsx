import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Truck, RefreshCw, Shield, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryDesk from "@/assets/category-desk.jpg";

const categoryLivingRoomPlaceholder = categorySofa;

const MOCK_PRODUCTS: Record<string, any> = {
  "1": { id: "1", name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá Sintered Stone", price: 25990000, originalPrice: 32990000, category: "Kệ Tivi", image: categoryTvStand, images: [categoryTvStand, categorySofa, categoryDiningTable, categoryCoffeeTable], description: "Kệ tivi cao cấp kết hợp hoàn hảo giữa gỗ óc chó tự nhiên và mặt đá sintered stone.", features: ["Chất liệu: Gỗ óc chó + Đá Sintered", "Kích thước: 180cm", "Bảo hành: 2 năm"], colors: ["Nâu Óc Chó", "Tự Nhiên"] },
  "2": { id: "2", name: "Sofa Góc Chữ L Vải Nhung Ý Cao Cấp", price: 45990000, originalPrice: 52000000, category: "Sofa", image: categorySofa, images: [categorySofa, categoryLivingRoomPlaceholder, categoryCoffeeTable, categoryDiningTable], description: "Sofa cao cấp với chất liệu vải nhung nhập khẩu, khung gỗ sồi tự nhiên.", features: ["Khung gỗ sồi", "Vải nhung kháng khuẩn", "Đệm mút 4 lớp"], colors: ["Xám Chuột", "Xanh Navy", "Be"] },
  "3": { id: "3", name: "Bàn Ăn Mặt Đá Marble Chân Gỗ Óc Chó", price: 32990000, originalPrice: 38990000, category: "Bàn Ăn", image: categoryDiningTable, images: [categoryDiningTable, categoryCoffeeTable, categorySofa, categoryTvStand], description: "Mặt đá Marble tự nhiên vân mây kết hợp chân gỗ óc chó cao cấp.", features: ["Đá Marble tự nhiên", "Chân gỗ óc chó", "Kèm 6 ghế bọc da"], colors: ["Trắng Vân Mây", "Đen Tia Chớp"] },
  "4": { id: "4", name: "Bàn Trà Tròn Mặt Kính Cường Lực", price: 12990000, category: "Bàn Trà", image: categoryCoffeeTable, images: [categoryCoffeeTable, categorySofa, categoryTvStand, categoryDiningTable], description: "Thiết kế tối giản với mặt kính cường lực và chân inox mạ titan.", features: ["Kính cường lực 12mm", "Chân inox 304", "Chống trầy xước"], colors: ["Vàng Gương", "Bạc Chrome"] },
  "6": { id: "6", name: "Giường Ngủ Bọc Da Ý Khung Inox", price: 38990000, category: "Giường", image: categoryBed, images: [categoryBed, categorySofa, categoryDiningTable, categoryDesk], description: "Giường ngủ bọc da bò thật nhập khẩu từ Ý, thiết kế chuẩn ergonomic.", features: ["Da bò thật 100%", "Khung thép chịu lực", "Bảo hành 5 năm"], colors: ["Nâu Bò", "Kem", "Đen"] },
  "7": { id: "7", name: "Đèn Chùm Pha Lê Luxury Style", price: 15990000, category: "Đèn", image: categoryBed, images: [categoryBed, categoryDiningTable, categorySofa, categoryCoffeeTable], description: "Đèn chùm pha lê lấp lánh, tạo điểm nhấn sang trọng.", features: ["Pha lê K9 cao cấp", "Khung kim loại mạ vàng", "Tiết kiệm điện"], colors: ["Vàng Gold"] },
  "14": { id: "14", name: "Tủ Quần Áo Gỗ Sồi 4 Cánh Hiện Đại", price: 22000000, category: "Tủ Quần Áo", image: categorySofa, images: [categorySofa, categoryBed, categoryDesk, categoryDiningTable], description: "Tủ quần áo gỗ sồi tự nhiên với không gian lưu trữ rộng rãi.", features: ["Gỗ Sồi tự nhiên", "Chống mối mọt", "Ray trượt giảm chấn"], colors: ["Sồi Tự Nhiên", "Sồi Trắng"] }
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  const product = MOCK_PRODUCTS[id || "1"] || MOCK_PRODUCTS["1"];

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedColor(0);
  }, [id, pathname]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      variant: product.colors[selectedColor]
    });
  };

  const isFavorite = isInWishlist(product.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/noi-that" className="hover:text-primary">Sản phẩm</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="container-luxury py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                ))}
              </div>
            </div>

            <div className="animate-fade-in">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6"><span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.price)}</span></div>
              <p className="text-muted-foreground mb-6">{product.description}</p>
              
              <div className="mb-6">
                <span className="font-semibold text-sm mb-3 block">Màu sắc: {product.colors[selectedColor]}</span>
                <div className="flex gap-2">
                  {product.colors.map((color: string, idx: number) => (
                    <button key={color} onClick={() => setSelectedColor(idx)} className={`px-4 py-2 rounded-lg border text-sm font-medium ${selectedColor === idx ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>{color}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <span className="font-semibold text-sm mb-3 block">Số lượng</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <Button size="lg" className="flex-1 btn-hero" onClick={handleAddToCart}><ShoppingBag className="w-5 h-5 mr-2" /> Thêm Vào Giỏ</Button>
                <Button size="lg" variant="outline" className={`px-4 ${isFavorite ? 'text-primary' : ''}`} onClick={() => toggleWishlist(product)}><Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} /></Button>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg text-center">
                <div><Truck className="w-6 h-6 mx-auto mb-1 text-primary" /><span className="text-xs">Freeship</span></div>
                <div><RefreshCw className="w-6 h-6 mx-auto mb-1 text-primary" /><span className="text-xs">30 ngày đổi trả</span></div>
                <div><Shield className="w-6 h-6 mx-auto mb-1 text-primary" /><span className="text-xs">2 năm bảo hành</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}