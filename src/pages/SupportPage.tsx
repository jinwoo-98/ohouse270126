import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Truck, RefreshCw, Shield, CreditCard, HelpCircle, FileText, Phone, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

const supportMenu = [
  { slug: "huong-dan", title: "Hướng Dẫn Mua Hàng", icon: FileText },
  { slug: "doi-tra", title: "Chính Sách Đổi Trả", icon: RefreshCw },
  { slug: "bao-hanh", title: "Chính Sách Bảo Hành", icon: Shield },
  { slug: "thanh-toan", title: "Hình Thức Thanh Toán", icon: CreditCard },
  { slug: "van-chuyen", title: "Chính Sách Vận Chuyển", icon: Truck },
  { slug: "faq", title: "Câu Hỏi Thường Gặp", icon: HelpCircle },
];

export default function SupportPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', slug || 'huong-dan')
      .single();
    
    setPageData(data);
    setLoading(false);
  };

  const Icon = supportMenu.find(m => m.slug === slug)?.icon || FileText;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{pageData?.title || "Hỗ trợ"}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 shadow-subtle sticky top-24">
                <h3 className="font-bold text-lg mb-4">Trung Tâm Hỗ Trợ</h3>
                <nav className="space-y-1">
                  {supportMenu.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/ho-tro/${item.slug}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        slug === item.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            <motion.div 
              className="lg:col-span-3"
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
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold">{pageData.title}</h1>
                    </div>
                    <div 
                      className="prose prose-stone max-w-none text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: pageData.content || '' }}
                    />
                  </>
                ) : (
                  <div className="text-center py-20">Không tìm thấy trang yêu cầu.</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}