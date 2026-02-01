import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LayoutGrid, ChevronDown, ChevronUp, Home, Palette, Layers, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import { InspirationLookCard } from "@/components/inspiration/InspirationLookCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useLookbookFilters } from "@/hooks/useLookbookFilters";
import { InspirationToolbar } from "@/components/inspiration/InspirationToolbar"; // Import mới
import { cn } from "@/lib/utils";

export default function InspirationPage() {
  const { 
    filteredLooks, 
    filterOptions, 
    filters, 
    updateFilter, 
    isLoading 
  } = useLookbookFilters();
  
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const handleResetFilters = () => {
    updateFilter('selectedCategorySlug', 'all');
    updateFilter('selectedStyle', 'all');
    updateFilter('selectedMaterial', 'all');
    updateFilter('selectedColor', 'all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Cảm hứng thiết kế" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Cảm Hứng Thiết Kế</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Khám phá những ý tưởng nội thất độc đáo và tinh tế từ OHOUSE
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Toolbar (Sticky) */}
        <InspirationToolbar 
          lookCount={filteredLooks.length}
          filterOptions={filterOptions}
          filters={filters}
          updateFilter={updateFilter}
          onResetFilters={handleResetFilters}
        />

        {/* Lookbook Grid */}
        <section className="py-12 md:py-16">
          <div className="container-luxury">
            
            {/* Lookbook Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : filteredLooks.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl text-muted-foreground italic">
                Không tìm thấy Lookbook nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredLooks.map((look, index) => (
                  <InspirationLookCard key={look.id} look={look} index={index} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-charcoal text-cream">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Cần Tư Vấn Thiết Kế Riêng?</h2>
            <p className="text-taupe mb-8 max-w-xl mx-auto">
              Đội ngũ kiến trúc sư của chúng tôi sẵn sàng biến ý tưởng của bạn thành hiện thực.
            </p>
            <Button className="btn-hero" asChild>
              <Link to="/thiet-ke">
                Yêu Cầu Thiết Kế
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <QuickViewSheet product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}