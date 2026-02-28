import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { InspirationLookCard } from "@/components/inspiration/InspirationLookCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { LookQuickViewSheet } from "@/components/inspiration/LookQuickViewSheet";
import { useLookbookFilters } from "@/hooks/useLookbookFilters";
import { InspirationToolbar } from "@/components/inspiration/InspirationToolbar";
import { Helmet } from "react-helmet-async";

export default function InspirationPage() {
  const { 
    filteredLooks, 
    filterOptions, 
    filters, 
    updateFilter, 
    isLoading 
  } = useLookbookFilters();
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewLook, setQuickViewLook] = useState<any>(null);

  const handleResetFilters = () => {
    updateFilter('selectedCategorySlug', 'all');
    updateFilter('selectedStyle', []);
    updateFilter('selectedMaterial', []);
    updateFilter('selectedColor', []);
  };
  
  const currentCategory = filterOptions.categories.find((c: any) => c.slug === filters.selectedCategorySlug);
  const pageTitle = currentCategory?.name || "Tất Cả Không Gian";

  return (
    <>
      <Helmet>
        <title>Cảm Hứng Thiết Kế Nội Thất | OHOUSE</title>
        <meta name="description" content="Khám phá những ý tưởng thiết kế nội thất độc đáo, sang trọng cho mọi không gian sống. Từ phòng khách Bắc Âu đến phòng ngủ hiện đại, OHOUSE mang đến nguồn cảm hứng bất tận." />
        <meta property="og:title" content="Cảm Hứng Thiết Kế Nội Thất | OHOUSE" />
        <meta property="og:description" content="Nguồn cảm hứng thiết kế nội thất cao cấp cho ngôi nhà của bạn." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <section className="bg-secondary/50 py-8 md:py-12 border-b border-border/40">
            <div className="container-luxury">
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">Cảm hứng thiết kế</span>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal leading-tight">
                  {pageTitle}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Khám phá những ý tưởng nội thất độc đáo và tinh tế từ OHOUSE
                </p>
              </motion.div>
            </div>
          </section>
          
          <InspirationToolbar 
            lookCount={filteredLooks.length}
            filterOptions={filterOptions}
            filters={filters}
            updateFilter={updateFilter}
            onResetFilters={handleResetFilters}
          />

          <section className="py-12 md:py-16">
            <div className="container-luxury">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
              ) : filteredLooks.length === 0 ? (
                <div className="text-center py-20 bg-secondary/20 rounded-3xl text-muted-foreground italic">
                  Không tìm thấy Lookbook nào phù hợp với bộ lọc.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredLooks.map((look, index) => (
                    <InspirationLookCard 
                      key={look.id} 
                      look={look} 
                      index={index} 
                      onQuickView={setQuickViewProduct} 
                      onLookQuickView={setQuickViewLook}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="py-16 md:py-24 bg-secondary/30 border-t border-border/40">
            <div className="container-luxury text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-charcoal uppercase tracking-widest">Cần Tư Vấn Thiết Kế Riêng?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-sm md:text-base">
                Đội ngũ kiến trúc sư của chúng tôi sẵn sàng biến ý tưởng của bạn thành hiện thực với giải pháp không gian tối ưu.
              </p>
              <Button className="btn-hero h-12 px-10 rounded-2xl shadow-gold" asChild>
                <Link to="/thiet-ke">
                  Yêu Cầu Thiết Kế Ngay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
        
        {/* Product Quick View */}
        <QuickViewSheet 
          product={quickViewProduct} 
          isOpen={!!quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />

        {/* Lookbook Quick View */}
        <LookQuickViewSheet 
          look={quickViewLook}
          isOpen={!!quickViewLook}
          onClose={() => setQuickViewLook(null)}
          onProductQuickView={(p) => {
            setQuickViewLook(null);
            setQuickViewProduct(p);
          }}
        />
      </div>
    </>
  );
}