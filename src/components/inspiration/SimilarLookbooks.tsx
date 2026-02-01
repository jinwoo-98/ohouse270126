"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { SimilarLookbookCard } from "./SimilarLookbookCard"; // Import component mới

interface SimilarLookbooksProps {
  lookbooks: any[];
  title?: string;
  onQuickView: (product: any) => void; // Thêm prop onQuickView
}

export function SimilarLookbooks({ lookbooks, title = "Combo Tương Tự", onQuickView }: SimilarLookbooksProps) {
  if (!lookbooks || lookbooks.length === 0) return null;

  return (
    <section className="mt-20 mb-16">
      <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-charcoal">{title}</h2>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {lookbooks.map((look, index) => (
            <CarouselItem key={look.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              <SimilarLookbookCard look={look} index={index} onQuickView={onQuickView} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Đã loại bỏ CarouselPrevious và CarouselNext theo yêu cầu tối giản */}
      </Carousel>
    </section>
  );
}