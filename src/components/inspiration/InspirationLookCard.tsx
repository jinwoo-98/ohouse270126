import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Maximize } from "lucide-react";

interface Look {
  id: number;
  title: string;
  image: string;
  category: string;
  style: string;
  productsCount: number;
  href: string;
}

interface InspirationLookCardProps {
  look: Look;
  index: number;
}

export function InspirationLookCard({ look, index }: InspirationLookCardProps) {
  return (
    <motion.div
      key={look.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      layout
      // col-span-2 ensures it takes up double the space of a standard card in the grid
      className="col-span-2" 
    >
      <Link to={look.href} className="group block card-luxury">
        <div className="relative aspect-[4/3] img-zoom">
          <img 
            src={look.image} 
            alt={look.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-card text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              Xem Chi Tiết
            </span>
          </div>
          <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground px-3 py-1 rounded text-xs font-medium">
            {look.category}
          </span>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {look.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Phong cách: <span className="font-medium text-primary">{look.style}</span></span>
            <span>{look.productsCount} sản phẩm</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}