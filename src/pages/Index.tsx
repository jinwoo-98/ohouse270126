import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { USPBar } from "@/components/home/USPBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FlashSale } from "@/components/home/FlashSale";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSearch } from "@/components/home/TrendingSearch";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>OHOUSE - Nội Thất Cao Cấp | Sang Trọng & Hiện Đại</title>
        <meta name="description" content="OHOUSE - Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Mang đến không gian sống sang trọng, hiện đại với hàng nghìn sản phẩm đa dạng từ sofa, bàn ăn, giường ngủ đến đèn trang trí." />
        <meta property="og:title" content="OHOUSE - Nội Thất Cao Cấp | Sang Trọng & Hiện Đại" />
        <meta property="og:description" content="Thương hiệu nội thất cao cấp hàng đầu Việt Nam. Kiến tạo không gian sống đẳng cấp." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <HeroSlider />
          <div className="space-y-0"> {/* Wrapper to manage vertical flow */}
            <USPBar />
            <CategoryGrid />
            <FlashSale />
            <ShopTheLook />
            <FeaturedProducts />
            <TrendingSearch />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;