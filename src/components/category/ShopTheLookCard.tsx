import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ShopTheLookCardProps {
  look: any;
}

export function ShopTheLookCard({ look }: ShopTheLookCardProps) {
  return (
    <div className="md:col-span-2 group relative aspect-video md:aspect-[2/1] rounded-3xl overflow-hidden shadow-subtle hover:shadow-medium transition-all duration-500">
      <Link to={`/y-tuong/${look.id}`}>
        <img 
          src={look.image_url} 
          alt={look.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Shop The Look</span>
          <h3 className="text-lg md:text-xl font-bold leading-tight group-hover:text-primary transition-colors">{look.title}</h3>
          <div className="flex items-center gap-2 text-xs font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Khám phá ngay <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}