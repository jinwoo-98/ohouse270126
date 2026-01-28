import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function TrendingSearch() {
  const [keywords, setKeywords] = useState<any[]>([]);

  useEffect(() => {
    async function fetchKeywords() {
      const { data } = await supabase.from('trending_keywords').select('*').order('created_at', { ascending: false });
      setKeywords(data || []);
    }
    fetchKeywords();
  }, []);

  if (keywords.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-background border-t border-border/50">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Xu Hướng Tìm Kiếm</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Được quan tâm nhiều nhất</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 flex-1">
            {keywords.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/tim-kiem?q=${encodeURIComponent(item.keyword)}`}
                  className="px-4 py-2 bg-secondary/50 hover:bg-primary hover:text-primary-foreground border border-border/50 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap"
                >
                  {item.keyword}
                </Link>
              </motion.div>
            ))}
          </div>

          <Link 
            to="/noi-that" 
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary shrink-0"
          >
            Tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}