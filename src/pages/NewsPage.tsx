import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock, Loader2, Newspaper } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    setNews(data || []);
    setLoading(false);
  };

  const featured = news.find(n => n.is_featured) || news[0];
  const remaining = news.filter(n => n.id !== featured?.id);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 uppercase tracking-widest text-charcoal">Tin Tức & Sự Kiện</h1>
          <p className="text-muted-foreground mb-12">Cập nhật xu hướng và kiến thức nội thất mới nhất từ OHOUSE</p>

          {news.length === 0 ? (
            <div className="text-center py-20 bg-secondary/20 rounded-3xl">
              <Newspaper className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Hiện chưa có bài viết nào được đăng.</p>
            </div>
          ) : (
            <>
              {/* Featured News */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                  <Link to={`/tin-tuc/${featured.id}`} className="group block">
                    <div className="grid md:grid-cols-2 gap-8 bg-card rounded-3xl overflow-hidden shadow-subtle hover:shadow-medium transition-all">
                      <div className="aspect-[16/10] md:aspect-auto img-zoom overflow-hidden bg-secondary/30">
                        <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4 block">Tin nổi bật</span>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">{featured.title}</h2>
                        <p className="text-muted-foreground mb-8 line-clamp-3 leading-relaxed">{featured.excerpt}</p>
                        <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(featured.created_at).toLocaleDateString('vi-VN')}</span>
                          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {featured.read_time || '5 phút đọc'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {remaining.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/tin-tuc/${article.id}`} className="group block h-full">
                      <div className="card-luxury h-full flex flex-col rounded-3xl border border-border/40 overflow-hidden">
                        <div className="aspect-[16/10] overflow-hidden bg-secondary/30">
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">{article.category || 'Xu Hướng'}</span>
                          <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{article.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">{article.excerpt}</p>
                          <div className="pt-4 border-t border-border/40 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                            <span className="text-primary group-hover:translate-x-1 transition-transform">Xem thêm +</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}