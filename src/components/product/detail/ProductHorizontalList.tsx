import { ProductCard } from "@/components/ProductCard";

interface ProductHorizontalListProps {
  products: any[];
  title: string;
}

export function ProductHorizontalList({ products, title }: ProductHorizontalListProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Khám phá thêm</span>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-charcoal">{title}</h2>
        <div className="w-10 h-0.5 bg-primary mt-4 rounded-full" />
      </div>
      
      {/* Container with grid to maintain fixed item sizes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {products.map(p => (
          <div key={p.id} className="w-full">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}