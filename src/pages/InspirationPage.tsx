import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LayoutGrid, ChevronDown, ChevronUp, Home, Palette, Layers, Zap, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import { InspirationLookCard } from "@/components/inspiration/InspirationLookCard";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useLookbookFilters } from "@/hooks/useLookbookFilters";
import { InspirationToolbar } from "@/components/inspiration/InspirationToolbar";
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
    updateFilter('selectedStyle', []); // Reset về mảng rỗng
    updateFilter('selectedMaterial', []); // Reset về mảng rỗng
    updateFilter('selectedColor', []); // Reset về mảng rỗng
  };
  
  // FIX: Find category by slug, not ID
  const currentCategory = filterOptions.categories.find((c: any) => c.slug === filters.selectedCategorySlug);
  const pageTitle = currentCategory?.name || "Tất Cả Không Gian";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* New Header Section */}
        <section className="bg-secondary/50 py-8 md:py-12 border-b border-border/40">
          <div className="container-luxury">
            {/* Breadcrumb */}
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
        
        {/* Toolbar (Now part of the flow) */}
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