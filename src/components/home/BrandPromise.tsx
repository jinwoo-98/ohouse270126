import { motion } from "framer-motion";
import { Award, Users, Sparkles, HeartHandshake } from "lucide-react";

const stats = [
  {
    icon: Award,
    value: "10+",
    label: "Năm Kinh Nghiệm",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Khách Hàng Hài Lòng",
  },
  {
    icon: Sparkles,
    value: "5K+",
    label: "Sản Phẩm Đa Dạng",
  },
  {
    icon: HeartHandshake,
    value: "100%",
    label: "Cam Kết Chất Lượng",
  },
];

export function BrandPromise() {
  return (
    <section className="py-16 md:py-24 bg-charcoal text-cream relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-light rounded-full blur-3xl" />
      </div>

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Vì Sao Chọn OHOUSE?</h2>
          <p className="text-taupe max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến những sản phẩm nội thất chất lượng cao với 
            thiết kế sang trọng, phù hợp với mọi không gian sống hiện đại.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                {stat.value}
              </div>
              <p className="text-taupe">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
