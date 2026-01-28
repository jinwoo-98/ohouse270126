import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Maximize, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import { supabase } from "@/integrations/supabase/client";

const categories = ["Tất Cả", "Căn Hộ", "Biệt Thự", "Nhà Phố", "Văn Phòng", "Khách Sạn"];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("Tất Cả");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = activeCategory === "Tất Cả" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={heroLivingRoom} alt="Dự án nội thất" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-cream px-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Dự Án Nội Thất</h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                Những công trình tiêu biểu được OHOUSE thiết kế và thi công
              </p>
            </motion.div>
          </div>
        </section>

        {/* Projects */}
        <section className="py-12 md:py-16">
          <div className="container-luxury">
            {/* Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-charcoal text-cream"
                      : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Chưa có dự án nào trong danh mục này.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    layout
                  >
                    <Link to={`/du-an/${project.id}`} className="group block card-luxury">
                      <div className="relative aspect-[4/3] img-zoom">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-card text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <Maximize className="w-4 h-4" />
                            Xem Chi Tiết
                          </span>
                        </div>
                        <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground px-3 py-1 rounded text-xs font-medium">
                          {project.category}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </span>
                          <span>{project.area}</span>
                        </div>
                        <p className="text-xs text-primary mt-2 font-medium">{project.style}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-charcoal text-cream">
          <div className="container-luxury text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Bạn Có Dự Án Cần Tư Vấn?</h2>
            <p className="text-taupe mb-8 max-w-xl mx-auto">
              Đội ngũ thiết kế chuyên nghiệp của OHOUSE sẵn sàng đồng hành cùng bạn
            </p>
            <Button className="btn-hero" asChild>
              <Link to="/lien-he">
                Liên Hệ Ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}