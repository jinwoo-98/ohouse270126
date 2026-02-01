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

interface SimilarLookbooksProps {
  lookbooks: any[];
  title?: string;
}

export function SimilarLookbooks({ lookbooks, title = "Combo Tương Tự" }: SimilarLookbooksProps) {
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
          {lookbooks.map((look, index) => {
            const productCount = look.shop_look_items?.length || 0;
            
            return (
              <CarouselItem key={look.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group flex flex-col bg-transparent rounded-2xl overflow-hidden h-full"
                >
                  <Link to={`/y-tuong/${look.id}`} className="block card-luxury">
                    <div className="relative aspect-square overflow-hidden bg-secondary/15 shrink-0 rounded-2xl">
                      <img 
                        src={look.image_url} 
                        alt={look.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 bg-charcoal/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {productCount} SP
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-sm font-bold text-charcoal hover:text-primary transition-colors line-clamp-2 leading-snug h-10">
                        {look.title}
                      </h3>
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest text-primary mt-2 group">
                        Khám phá <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-0 -translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 shadow-medium border-border/50" />
        <CarouselNext className="hidden md:flex right-0 translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-charcoal hover:bg-primary hover:text-white transition-all duration-300 shadow-medium border-border/50" />
      </Carousel>
    </section>
  );
}