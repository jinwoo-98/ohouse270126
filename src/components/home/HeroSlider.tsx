import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";

const slides = [
  {
    id: 1,
    image: heroLivingRoom,
    title: "Phòng Khách Sang Trọng",
    subtitle: "Bộ Sưu Tập Mới 2024",
    description: "Nâng tầm không gian sống với những thiết kế độc đáo và chất liệu cao cấp",
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
    <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-luxury">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl"
            >
              <span className="inline-block text-primary font-medium uppercase tracking-widest text-sm mb-4">
                {slides[currentSlide].subtitle}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-cream mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg text-cream/80 mb-8 max-w-md">
                {slides[currentSlide].description}
              </p>
              <Button
                size="lg"
                className="btn-hero"
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

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-card/20 backdrop-blur-sm rounded-full text-cream hover:bg-primary transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-card/20 backdrop-blur-sm rounded-full text-cream hover:bg-primary transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary w-8"
                : "bg-cream/50 hover:bg-cream/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
