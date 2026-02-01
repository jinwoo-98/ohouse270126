import { LookProductFullItem } from "./LookProductFullItem"; // Import thẻ đầy đủ
import { cn } from "@/lib/utils";

interface LookProductVerticalListProps {
  products: any[];
  title?: string;
  onQuickView: (product: any) => void;
}

export function LookProductVerticalList({ products, title = "Sản phẩm tương tự", onQuickView }: LookProductVerticalListProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-charcoal">{title}</h2>
      
      {/* Grid 2 cột cho danh sách dọc */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {products.map((product) => (
          <LookProductFullItem 
            key={product.id} 
            product={product} 
            onQuickView={onQuickView} 
          />
        ))}
      </div>
    </section>
  );
}