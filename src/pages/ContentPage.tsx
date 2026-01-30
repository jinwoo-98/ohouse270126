import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Loader2, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.substring(1);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPage();
    } else {
      navigate("/404");
    }
  }, [slug, navigate]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error || !data) {
        setPageData(null);
      } else {
        setPageData(data);
      }
    } catch (e) {
      setPageData(null);
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
              <span className="text-foreground font-medium">{pageData?.title || "..."}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-card rounded-lg p-6 md:p-10 shadow-subtle min-h-[500px]">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : pageData ? (
                <>
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">{pageData.title}</h1>
                  </div>
                  <div 
                    className="prose prose-lg prose-stone max-w-none text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pageData.content || '' }}
                  />
                </>
              ) : (
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Trang không tồn tại</h1>
                  <p className="text-muted-foreground mt-4">Nội dung bạn tìm kiếm không có sẵn hoặc đã bị xóa.</p>
                  <Button asChild className="mt-8"><Link to="/">Về trang chủ</Link></Button>
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