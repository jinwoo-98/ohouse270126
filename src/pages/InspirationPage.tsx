import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import { InspirationLookCard } from "@/components/inspiration/InspirationLookCard";
import { supabase } from "@/integrations/supabase/client";
import { QuickViewSheet } from "@/components/QuickViewSheet";
import { useCategories } from "@/hooks/useCategories";

export default function InspirationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [looks, setLooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  
  const { data: categoriesData } = useCategories();

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_looks')
        .select('*, shop_look_items(*, products(*))')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      setLooks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterTabs = useMemo(() => {
    if (!categoriesData || !looks) return [];
    const lookCategories = new Set(looks.map(l => l.category_id));
    const tabs = categoriesData.mainCategories
      .filter(c => c.dropdownKey && lookCategories.has(c.dropdownKey))
      .map(c => ({ name: c.name, slug: c.dropdownKey! }));
    return [{ name: "Tất Cả", slug: "all" }, ...tabs];
  }, [categoriesData, looks]);

  const filteredLooks = activeTab === "all" 
    ? looks 
    : looks.filter(look => look.category_id === activeTab);

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

        {/* Lookbook Grid */}
        <section className="py-12 md:py-16">
          <div className="container-luxury">
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {filterTabs.map((tab) => (
                <button
                  key={tab.slug}
                  onClick={() => setActiveTab(tab.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.slug
                      ? "bg-charcoal text-cream"
                      : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
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