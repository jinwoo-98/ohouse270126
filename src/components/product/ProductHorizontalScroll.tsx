"use client";

import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "../ProductCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductHorizontalScrollProps {
  products: any[];
  title?: string;
  onQuickView: (product: any) => void;
}

export function ProductHorizontalScroll({ products, title = "Sản phẩm liên quan", onQuickView }: ProductHorizontalScrollProps) {
  const isMobile = useIsMobile();
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold uppercase tracking-widest mb-8">{title}</h2>
      
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              {/* Sử dụng ProductCard để giữ nguyên giao diện */}
              <ProductCard product={product} className="shadow-none hover:shadow-medium" />
            </CarouselItem>
          ))}
        </CarouselContent>
        {!isMobile && (
          <>
            <CarouselPrevious className="flex left-0 -translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 shadow-medium border-border/50" />
            <CarouselNext className="flex right-0 translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 shadow-medium border-border/50" />
          </>
        )}
      </Carousel>
    </section>
  );
}