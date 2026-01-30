import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { ProductHorizontalCard } from "./ProductHorizontalCard";

interface RelatedProductsProps {
  products: any[];
  title?: string;
  onQuickView: (product: any) => void;
}

export function ProductHorizontalList({ products, title = "Sản phẩm tương tự", onQuickView }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold uppercase tracking-widest mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductHorizontalCard key={p.id} product={p} onQuickView={onQuickView} />
        ))}
      </div>
    </section>
  );
}