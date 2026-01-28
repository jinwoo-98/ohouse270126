import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Facebook, Twitter, Link as LinkIcon, Loader2, User } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      toast.error("Bài viết không tồn tại");
      navigate("/tin-tuc");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết bài viết!");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!article) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury max-w-4xl">
          <Link to="/tin-tuc" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại tin tức
          </Link>

          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl overflow-hidden shadow-subtle p-6 md:p-10 border border-border/40"
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                {article.category}
              </span>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.read_time || '5 phút đọc'}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight text-charcoal">{article.title}</h1>

            {article.image_url && (
              <div className="aspect-[21/9] rounded-xl overflow-hidden mb-10 shadow-md">
                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div 
              className="prose prose-lg prose-stone max-w-none text-foreground/80 leading-relaxed mb-10"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Admin OHOUSE</p>
                  <p className="text-xs text-muted-foreground">Biên tập viên</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium mr-2 text-muted-foreground">Chia sẻ:</span>
                <Button variant="outline" size="icon" className="rounded-full w-9 h-9"><Facebook className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full w-9 h-9"><Twitter className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full w-9 h-9" onClick={handleShare}><LinkIcon className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.article>
        </div>
      </main>

      <Footer />
    </div>
  );
}