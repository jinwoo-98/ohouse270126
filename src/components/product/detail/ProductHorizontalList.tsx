import { ProductCard } from "@/components/ProductCard";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

interface ProductHorizontalListProps {
  products: any[];
  title: string;
}

export function ProductHorizontalList({ products, title }: ProductHorizontalListProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-20 overflow-hidden">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Khám phá thêm</span>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-charcoal">{title}</h2>
        <div className="w-10 h-0.5 bg-primary mt-4 rounded-full" />
      </div>
      
      <div className="px-4 md:px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((p) => (
              <CarouselItem key={p.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="h-full">
                  <ProductCard product={p} className="h-full border border-border/40" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 md:-left-12 h-10 w-10 border-border" />
          <CarouselNext className="hidden md:flex -right-4 md:-right-12 h-10 w-10 border-border" />
        </Carousel>
      </div>
    </section>
  );
}