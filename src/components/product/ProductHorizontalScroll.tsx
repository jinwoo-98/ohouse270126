"use client";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCarouselItem } from "./ProductCarouselItem"; // Import component mới

interface ProductHorizontalScrollProps {
  products: any[];
  title?: string;
  onQuickView: (product: any) => void;
}

export function ProductHorizontalScroll({ products, title = "Sản phẩm liên quan", onQuickView }: ProductHorizontalScrollProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold uppercase tracking-widest mb-8">{title}</h2>
      
      <Carousel
        opts={{
          align: "start",
          // Thêm options để tối ưu hóa trải nghiệm vuốt trên mobile
          dragFree: true, // Cho phép kéo tự do
          containScroll: 'trimSnaps', // Giữ cuộn trong giới hạn
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              {/* Sử dụng ProductCarouselItem */}
              <ProductCarouselItem product={product} onQuickView={onQuickView} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Nút điều hướng: Ẩn trên mobile (hidden), chỉ hiện trên desktop (md:flex) */}
        <CarouselPrevious className="hidden md:flex left-0 -translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 shadow-medium border-border/50" />
        <CarouselNext className="hidden md:flex right-0 translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 shadow-medium border-border/50" />
      </Carousel>
    </section>
  );
}