import { Truck, RefreshCw, Shield, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const usps = [
  {
    icon: Truck,
    title: "Miễn Phí Vận Chuyển",
    description: "Cho đơn hàng từ 5 triệu",
  },
  {
    icon: RefreshCw,
    title: "Đổi Trả 30 Ngày",
    description: "Hoàn tiền 100% nếu không hài lòng",
  },
  {
    icon: Shield,
    title: "Bảo Hành 2 Năm",
    description: "Cam kết chất lượng sản phẩm",
  },
  {
    icon: CreditCard,
    title: "Thanh Toán An Toàn",
    description: "Bảo mật thông tin tuyệt đối",
  },
];

export function USPBar() {
  return (
    <section className="bg-secondary py-8 border-y border-border">
      <div className="container-luxury">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {usps.map((usp, index) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <usp.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{usp.title}</h3>
                <p className="text-sm text-muted-foreground">{usp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
