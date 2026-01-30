import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function HeroSlider() {
  const [slides, setSlides] = useState<any[]>([]);
  const [[page, direction], setPage] = useState([0, 0]);
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

  const imageIndex = page % slides.length;
  const current = slides[imageIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        paginate(1);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides.length, page]);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  if (loading) return <div className="h-[60vh] md:h-[85vh] bg-charcoal flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (slides.length === 0) return null;

  return (
    <section className="relative h-[60vh] md:h-[85vh] overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
          >
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "linear" }}
              src={current.image_url}
              alt={current.title}
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Container nội dung: pointer-events-none để cho phép vuốt xuyên qua */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="container-luxury w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className={`max-w-2xl relative z-10 pointer-events-auto ${
                current.text_align === 'left' ? 'mr-auto text-left' : 
                current.text_align === 'right' ? 'ml-auto text-right' : 
                'mx-auto text-center'
              }`}
              style={{ color: current.text_color || '#ffffff' }}
            >
              {current.subtitle && (
                <motion.span 
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.2em" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="inline-block text-primary font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm mb-2 md:mb-4"
                >
                  {current.subtitle}
                </motion.span>
              )}
              
              <h1 
                className="text-3xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight whitespace-pre-line" 
                style={{ color: current.text_color || '#ffffff' }}
              >
                {current.title}
              </h1>
              
              {current.description && (
                <div 
                  className="text-sm md:text-xl mb-6 md:mb-8 max-w-lg leading-relaxed px-4 md:px-0 opacity-90 rich-text-content"
                  style={{ color: current.text_color || '#ffffff' }}
                  dangerouslySetInnerHTML={{ __html: current.description }}
                />
              )}
              
              {current.cta_text && (
                <Button
                  size="lg"
                  className="btn-hero h-12 md:h-14 px-8 md:px-10 text-xs md:text-sm"
                  asChild
                >
                  <a href={current.cta_link}>
                    {current.cta_text}
                  </a>
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          {/* Nút điều hướng: Ẩn trên mobile (hidden), hiện trên desktop (md:flex) */}
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
                onClick={() => setPage([index, index > imageIndex ? 1 : -1])}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === imageIndex ? "bg-primary w-8 md:w-12" : "bg-white/30 w-2 md:w-3 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}