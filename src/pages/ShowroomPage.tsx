import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Loader2, MapPin } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ShowroomCard } from "@/components/ShowroomCard";

export default function ShowroomPage() {
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('showrooms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setShowrooms(data || []);
    } catch (e) {
      console.error("Error fetching showrooms:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Hệ Thống Showroom</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-card rounded-lg p-6 md:p-10 shadow-subtle min-h-[500px]">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Hệ Thống Showroom OHOUSE</h1>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : showrooms.length === 0 ? (
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Chưa có Showroom nào</h1>
                  <p className="text-muted-foreground mt-4">Vui lòng thêm thông tin showroom trong trang quản trị.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {showrooms.map((showroom, index) => (
                    <ShowroomCard key={showroom.id} showroom={showroom} index={index} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}