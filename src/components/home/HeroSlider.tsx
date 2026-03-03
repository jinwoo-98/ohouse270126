import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { Helmet } from "react-helmet-async";

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function HeroSlider() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data } = await supabase
        .from('slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      setSlides(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (newDirection: number) => {
    if (slides.length <= 1) return;
    let newIndex = currentIndex + newDirection;
    if (newIndex < 0) {
      newIndex = slides.length - 1;
    } else if (newIndex >= slides.length) {
      newIndex = 0;
    }
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        paginate(1);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides.length, currentIndex]);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  if (loading) return <div className="h-[65vh] md:h-[80vh] bg-secondary/20 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  
  if (slides.length === 0) return null;

  return (
    <section className="relative h-[65vh] md:h-[80vh] overflow-hidden bg-secondary/20">
      <motion.div
        className="flex h-full w-full cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="relative h-full w-full flex-shrink-0">
            {index === 0 && (
              <Helmet>
                <link
                  rel="preload"
                  as="image"
                  href={getOptimizedImageUrl(slide.image_url, { width: 1920, quality: 85 })}
                />
              </Helmet>
            )}
            <img
              src={getOptimizedImageUrl(slide.image_url, { width: 1920, quality: 85 })}
              alt={slide.title}
              className="absolute h-full w-full object-cover pointer-events-none"
              draggable="false"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            
            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
              <div className="container-luxury w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`max-w-2xl relative z-10 pointer-events-auto ${
                    slide.text_align === 'left' ? 'mr-auto text-left' : 
                    slide.text_align === 'right' ? 'ml-auto text-right' : 
                    'mx-auto text-center'
                  }`}
                  style={{ color: slide.text_color || '#ffffff' }}
                >
                  {slide.subtitle && (
                    <span className="inline-block text-primary font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm mb-2 md:mb-4">
                      {slide.subtitle}
                    </span>
                  )}
                  
                  {/* Điều chỉnh kích thước tiêu đề Banner: Giảm từ 7xl xuống 6xl ở màn hình lớn */}
                  <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight whitespace-pre-line">
                    {slide.title}
                  </h1>
                  
                  {slide.description && (
                    <div 
                      className="text-sm md:text-lg mb-6 md:mb-8 max-w-lg leading-relaxed px-4 md:px-0 opacity-90 rich-text-content"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.description) }}
                    />
                  )}
                  
                  {slide.cta_text && (
                    <Button
                      size="lg"
                      className="btn-hero h-12 md:h-14 px-8 md:px-10 text-xs md:text-sm"
                      asChild
                    >
                      <a href={slide.cta_link}>
                        {slide.cta_text}
                      </a>
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {slides.length > 1 && (
        <>
          <button 
            onClick={() => paginate(-1)} 
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-20 items-center justify-center group shadow-medium"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button 
            onClick={() => paginate(1)} 
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 z-20 items-center justify-center group shadow-medium"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 pointer-events-auto ${index === currentIndex ? "bg-primary w-8 md:w-12" : "bg-white/30 w-2 md:w-3 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}