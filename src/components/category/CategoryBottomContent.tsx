"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CategoryBottomContentProps {
  categoryId?: string;
  categorySlug?: string;
  seoContent?: string;
  isParentCategory?: boolean;
}

export function CategoryBottomContent({ categoryId, categorySlug, seoContent, isParentCategory }: CategoryBottomContentProps) {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [shopLooks, setShopLooks] = useState<any[]>([]);

  useEffect(() => {
    if (categoryId) {
      fetchKeywords();
      // Only fetch looks if not a parent category (as per user request)
      if (!isParentCategory && categorySlug) {
        fetchLooks();
      }
    }
  }, [categoryId, categorySlug, isParentCategory]);

  const fetchKeywords = async () => {
    const { data } = await supabase
      .from('trending_keywords')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .limit(10);
    setKeywords(data || []);
  };

  const fetchLooks = async () => {
    // Find looks related to this category
    const { data } = await supabase
      .from('shop_looks')
      .select('*')
      .eq('category_id', categorySlug) // Using slug matching as per existing setup
      .eq('is_active', true)
      .limit(4);
    setShopLooks(data || []);
  };

  return (
    <div className="space-y-16 mt-16">
      {/* 1. Trending Keywords */}
      {keywords.length > 0 && (
        <section className="py-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">Xu Hướng Tìm Kiếm</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 flex-1">
              {keywords.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/tim-kiem?q=${encodeURIComponent(item.keyword)}`}
                  className="px-4 py-2 bg-secondary/30 hover:bg-primary hover:text-primary-foreground border border-border/50 rounded-full text-xs font-medium transition-all duration-300"
                >
                  {item.keyword}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Mini Shop The Look (Subcategories Only) */}
      {!isParentCategory && shopLooks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-widest">Cảm Hứng Phối Phòng</h2>
            </div>
            <Button variant="link" asChild className="text-primary p-0 h-auto font-bold text-xs uppercase tracking-wider">
              <Link to="/cam-hung">Xem tất cả <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopLooks.map((look, idx) => (
              <motion.div 
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img 
                  src={look.image_url} 
                  alt={look.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold uppercase tracking-wide truncate w-full">{look.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SEO Content */}
      {seoContent && (
        <section className="bg-white p-8 md:p-12 rounded-[32px] border border-border/60 shadow-subtle">
          <div 
            className="rich-text-content prose prose-stone max-w-none text-muted-foreground prose-headings:text-charcoal prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: seoContent }} 
          />
        </section>
      )}
    </div>
  );
}