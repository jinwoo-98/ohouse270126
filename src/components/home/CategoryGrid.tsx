import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

const categories = [
  { name: "Kệ Tivi", image: categoryTvStand, href: "/ke-tivi" },
  { name: "Sofa & Ghế", image: categorySofa, href: "/sofa" },
  { name: "Bàn Ăn", image: categoryDiningTable, href: "/ban-an" },
  { name: "Bàn Trà", image: categoryCoffeeTable, href: "/ban-tra" },
  { name: "Bàn Làm Việc", image: categoryDesk, href: "/ban-lam-viec" },
  { name: "Giường", image: categoryBed, href: "/giuong" },
  { name: "Đèn Trang Trí", image: categoryLighting, href: "/den-trang-tri" },
];

export function CategoryGrid() {
  return (
    <section className="py-10 md:py-24">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="section-title mb-2 md:mb-4">Danh Mục Sản Phẩm</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Khám phá bộ sưu tập nội thất cao cấp với hàng nghìn sản phẩm đa dạng
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={category.href}
                className="group block card-luxury"
              >
                <div className="aspect-square img-zoom">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 md:p-4 text-center">
                  <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Sale Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <Link
              to="/sale"
              className="group block card-luxury bg-destructive/5 hover:bg-destructive/10"
            >
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center p-6">
                  <span className="text-3xl md:text-5xl font-bold text-destructive">
                    SALE
                  </span>
                  <p className="mt-2 text-xs md:text-sm text-destructive/80">
                    Giảm đến 50%
                  </p>
                </div>
              </div>
              <div className="p-3 md:p-4 text-center">
                <h3 className="font-semibold text-sm md:text-base text-destructive">
                  Khuyến Mãi
                </h3>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}