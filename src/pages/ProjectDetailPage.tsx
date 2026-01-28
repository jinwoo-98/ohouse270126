import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Maximize2, Loader2, Calendar, MapPin, Layout } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      toast.error("Không tìm thấy dự án");
      navigate("/du-an");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!project) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-charcoal text-cream py-16">
          <div className="container-luxury">
            <Link to="/du-an" className="inline-flex items-center text-sm text-taupe hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tất cả dự án
            </Link>
            <div className="grid lg:grid-cols-2 gap-12 items-end">
              <div>
                <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">{project.category}</span>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">{project.title}</h1>
                <div className="text-taupe leading-relaxed text-lg max-w-xl line-clamp-3">
                  {/* Hiển thị đoạn ngắn hoặc description plain text nếu có */}
                  {project.description?.replace(/<[^>]+>/g, '').substring(0, 200)}...
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-walnut/20 p-6 rounded-xl border border-walnut/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-taupe font-bold tracking-widest">
                    <Layout className="w-3 h-3" /> Diện tích
                  </div>
                  <p className="font-bold">{project.area || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-taupe font-bold tracking-widest">
                    Phong cách
                  </div>
                  <p className="font-bold">{project.style || "Hiện đại"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-taupe font-bold tracking-widest">
                    <MapPin className="w-3 h-3" /> Vị trí
                  </div>
                  <p className="font-bold truncate">{project.location}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-taupe font-bold tracking-widest">
                    <Calendar className="w-3 h-3" /> Năm
                  </div>
                  <p className="font-bold">{project.year}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-luxury max-w-4xl">
            {/* Hình ảnh chính */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-elevated mb-12"
            >
              <img src={project.image_url} alt={project.title} className="w-full h-auto object-cover" />
            </motion.div>

            {/* Nội dung chi tiết (Rich Text) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />

            {/* Gallery (Nếu có - Hiện tại schema dùng image_url chính, nếu có gallery_urls thì map ở đây) */}
            {project.gallery_urls && project.gallery_urls.length > 0 && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.gallery_urls.map((img: string, idx: number) => (
                  <div key={idx} className="rounded-xl overflow-hidden shadow-subtle">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Bạn yêu thích phong cách này?</h2>
            <Button className="btn-hero" asChild>
              <Link to="/thiet-ke">Nhận tư vấn thiết kế tương tự</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}