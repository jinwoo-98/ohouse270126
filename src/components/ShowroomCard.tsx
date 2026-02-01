import { MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ShowroomCardProps {
  showroom: any;
  index: number;
}

export function ShowroomCard({ showroom, index }: ShowroomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-card p-6 md:p-8 rounded-3xl border border-border/40 shadow-subtle hover:shadow-medium transition-all duration-300 group"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {/* Image/Map Preview */}
        <div className="md:col-span-1 aspect-[4/3] rounded-2xl overflow-hidden bg-secondary/50 border border-border/40 shrink-0">
          {showroom.image_url ? (
            <img src={showroom.image_url} alt={showroom.name} className="w-full h-full object-cover" />
          ) : showroom.map_iframe_url ? (
            // Check if the content looks like an iframe (starts with '<iframe')
            showroom.map_iframe_url.trim().toLowerCase().startsWith('<iframe') ? (
              <div 
                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none"
                dangerouslySetInnerHTML={{ __html: showroom.map_iframe_url }}
              />
            ) : (
              // Fallback: Treat it as a simple URL and make it clickable
              <a 
                href={showroom.map_iframe_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-primary hover:underline text-sm font-bold"
              >
                <MapPin className="w-8 h-8 mb-2" />
                Mở bản đồ (Lỗi định dạng mã nhúng)
              </a>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
              <MapPin className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-charcoal group-hover:text-primary transition-colors">{showroom.name}</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
              <p className="text-muted-foreground leading-relaxed">{showroom.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <p className="font-bold text-charcoal">{showroom.phone}</p>
            </div>
            {showroom.working_hours && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <p className="text-muted-foreground">{showroom.working_hours}</p>
              </div>
            )}
          </div>
          
          <Button asChild className="btn-hero h-11 px-8 text-xs font-bold shadow-gold mt-4">
            <a href={`tel:${showroom.phone}`}>
              Liên Hệ Ngay <ChevronRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}