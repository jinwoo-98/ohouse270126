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
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  const { seo } = useSeo();

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:url" content={seo.url} />
        <meta property="og:type" content="website" />
        {seo.favicon && <link rel="icon" href={seo.favicon} />}
        {seo.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(seo.structuredData)}
          </script>
        )}
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <HeroSlider />
          <div className="space-y-0">
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