import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import heroBathroom from "@/assets/hero-bathroom.jpg";

const slides = [
  {
    id: 1,
    image: heroLivingRoom,
    title: "Phòng Khách Sang Trọng",
    subtitle: "Bộ Sưu Tập 2024",
    description: "Nâng tầm không gian sống với thiết kế độc đáo và chất liệu cao cấp",
    cta: "Khám Phá Ngay",
    href: "/phong-khach",
  },
  {
    id: 2,
    image: heroDiningRoom,
    title: "Phòng Ăn Hiện Đại",
    subtitle: "Thiết Kế Đặc Biệt",
    description: "Tạo nên những bữa ăn ấm cúng bên gia đình với nội thất tinh tế",
    cta: "Xem Thêm",
    href: "/phong-an",
  },
  {
    id: 3,
    image: heroBedroom,
    title: "Phòng Ngủ Êm Ái",
    subtitle: "Giấc Ngủ Hoàn Hảo",
    description: "Không gian nghỉ ngơi lý tưởng với nội thất chất lượng cao",
    cta: "Khám Phá",
    href: "/phong-ngu",
  },
  {
    id: 4,
    image: heroBathroom,
    title: "Phòng Tắm Luxury",
    subtitle: "Spa Tại Nhà",
    description: "Trải nghiệm thư giãn đẳng cấp với thiết bị vệ sinh cao cấp",
    cta: "Xem Ngay",
    href: "/phong-tam",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[65vh] md:h-[85vh] overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/40 via-transparent to-charcoal/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container-luxury">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.span 
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.2em" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="inline-block text-primary font-bold uppercase tracking-[0.2em] text-xs md:text-sm mb-4"
              >
                {slides[currentSlide].subtitle}
              </motion.span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-base md:text-xl text-cream/80 mb-8 max-w-lg mx-auto leading-relaxed">
                {slides[currentSlide].description}
              </p>
              <Button
                size="lg"
                className="btn-hero h-14 px-10"
                asChild
              >
                <a href={slides[currentSlide].href}>
                  {slides[currentSlide].cta}
                </a>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows - Vertical Rectangle Style */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 md:w-12 h-32 md:h-40 bg-card/20 backdrop-blur-md rounded-r-2xl text-cream hover:bg-primary hover:text-primary-foreground transition-all duration-500 z-20 flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 md:w-12 h-32 md:h-40 bg-card/20 backdrop-blur-md rounded-l-2xl text-cream hover:bg-primary hover:text-primary-foreground transition-all duration-500 z-20 flex items-center justify-center group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Luxury Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? "bg-primary w-12"
                : "bg-cream/30 w-3 hover:bg-cream/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}