"use client";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LookProductVerticalItem } from "./LookProductVerticalItem"; // Sử dụng thẻ tối giản

interface LookProductHorizontalScrollProps {
  products: any[];
  onQuickView: (product: any) => void;
}

export function LookProductHorizontalScroll({ products, onQuickView }: LookProductHorizontalScrollProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-8">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="pl-4 basis-1/4 sm:basis-1/5 md:basis-1/6">
              <LookProductVerticalItem product={product} onQuickView={onQuickView} className="rounded-2xl" imageClassName="rounded-t-2xl" />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Ẩn nút điều hướng trên mobile */}
        <CarouselPrevious className="hidden md:flex left-0 -translate-x-1/2 w-10 h-10" />
        <CarouselNext className="hidden md:flex right-0 translate-x-1/2 w-10 h-10" />
      </Carousel>
    </section>
  );
}