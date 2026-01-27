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
    }, 5000);
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
    <section className="relative h-[55vh] md:h-[75vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          {/* Changed gradient to center the focus */}
          <div className="absolute inset-0 bg-charcoal/60 via-charcoal/20 to-transparent" />
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
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg mx-auto text-center" // Added mx-auto and text-center
            >
              <span className="inline-block text-primary font-semibold uppercase tracking-widest text-xs md:text-sm mb-3">
                {slides[currentSlide].subtitle}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-cream mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-base md:text-lg text-cream/80 mb-6 max-w-md mx-auto"> {/* Added mx-auto */}
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
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-2.5 bg-card/30 backdrop-blur-sm rounded-full text-cream hover:bg-primary hover:text-primary-foreground transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2.5 bg-card/30 backdrop-blur-sm rounded-full text-cream hover:bg-primary hover:text-primary-foreground transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary w-8"
                : "bg-cream/50 w-2 hover:bg-cream/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}