import { useEffect, useState } from "react";
import { Truck, RefreshCw, Shield, CreditCard, Gift, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  Truck, RefreshCw, Shield, CreditCard, Gift, HelpCircle
};

export function USPBar() {
  const [usps, setUsps] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUSPs() {
      const { data } = await supabase.from('usps').select('*').order('display_order');
      setUsps(data || []);
    }
    fetchUSPs();
  }, []);

  if (usps.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-6 md:py-10">
      <div className="container-luxury">
        {/* Thay đổi grid-cols-2 thành grid-cols-4 để tất cả nằm trên 1 hàng */}
        <div className="grid grid-cols-4 gap-2 md:gap-8">
          {usps.slice(0, 4).map((usp, index) => {
            const Icon = iconMap[usp.icon_name] || Truck;
            
            return (
              <motion.div
                key={usp.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-4"
              >
                {/* Thu nhỏ icon trên mobile */}
                <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 md:w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  {/* Chỉnh font chữ tiêu đề nhỏ lại trên mobile để không bị xuống dòng */}
                  <h3 className="font-bold text-[8px] md:text-sm text-charcoal leading-tight uppercase md:normal-case">
                    {usp.title}
                  </h3>
                  {/* Ẩn mô tả trên mobile, chỉ hiện trên desktop */}
                  <p className="hidden md:block text-xs text-muted-foreground mt-1">
                    {usp.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}