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
    <section className="bg-secondary/40 py-10">
      <div className="container-luxury">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {usps.map((usp, index) => {
            const Icon = iconMap[usp.icon_name] || Truck;
            
            return (
              <motion.div
                key={usp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-charcoal">{usp.title}</h3>
                  <p className="text-xs text-muted-foreground">{usp.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}