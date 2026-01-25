import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { USPBar } from "@/components/home/USPBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FlashSale } from "@/components/home/FlashSale";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandPromise } from "@/components/home/BrandPromise";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSlider />
        <USPBar />
        <CategoryGrid />
        <FlashSale />
        <ShopTheLook />
        <FeaturedProducts />
        <BrandPromise />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
