import { Link } from "react-router-dom";
import { formatPrice, getOptimizedImageUrl, generateProductAltText, generateImageSrcSet } from "@/lib/utils";

interface RelatedProductsProps {
  products: any[];
  title?: string;
}

export function RelatedProducts({ products, title = "Sản phẩm tương tự" }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  const imageWidths = [300, 400, 600];
  const imageSizes = "(max-width: 767px) 50vw, 25vw";

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold uppercase tracking-widest mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => {
          const smartAlt = generateProductAltText(p);
          const srcSet = generateImageSrcSet(p.image_url, imageWidths);
          return (
            <Link key={p.id} to={`/san-pham/${p.slug || p.id}`} className="group block card-luxury">
              <div className="aspect-square overflow-hidden bg-secondary/10 relative">
                <img 
                  src={getOptimizedImageUrl(p.image_url, { width: 400 })} 
                  srcSet={srcSet}
                  sizes={imageSizes}
                  alt={smartAlt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                {p.is_sale && <span className="absolute top-2 left-2 bg-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-charcoal">Sale</span>}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-charcoal line-clamp-1 mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-primary font-bold text-sm">{formatPrice(p.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}