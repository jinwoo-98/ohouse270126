"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShowroomData {
  address: string;
  phone: string;
  email: string;
  working_hours: string;
  map_iframe_url: string;
}

export function ShowroomContent() {
  const [data, setData] = useState<ShowroomData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('address, phone, email, working_hours, map_iframe_url')
        .single();

      if (error) throw error;
      setData(settings as ShowroomData);
    } catch (e) {
      console.error("Error fetching showroom data:", e);
      toast.error("Không thể tải thông tin showroom.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Lỗi tải dữ liệu</h1>
        <p className="text-muted-foreground mt-4">Không tìm thấy thông tin cấu hình showroom.</p>
        <Button asChild className="mt-8"><Link to="/admin/settings">Cấu hình ngay</Link></Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid lg:grid-cols-2 gap-10 md:gap-16"
    >
      {/* Left Column: Map */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-charcoal">
          <MapPin className="w-5 h-5 text-primary" /> Vị Trí Showroom
        </h2>
        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-elevated border border-border/40">
          {data.map_iframe_url ? (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: data.map_iframe_url }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
              <p>Chưa có mã nhúng bản đồ.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Contact Info */}
      <div className="lg:col-span-1 space-y-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-charcoal">
          <Phone className="w-5 h-5 text-primary" /> Thông Tin Liên Hệ
        </h2>
        
        <div className="space-y-6 p-6 bg-card rounded-2xl shadow-subtle border border-border/40">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-1">Địa chỉ</h3>
              <p className="text-lg font-bold text-charcoal leading-relaxed">{data.address || "Đang cập nhật..."}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-1">Hotline</h3>
              <p className="text-lg font-bold text-charcoal leading-relaxed">{data.phone || "Đang cập nhật..."}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-1">Email</h3>
              <p className="text-lg font-bold text-charcoal leading-relaxed">{data.email || "Đang cập nhật..."}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-1">Giờ làm việc</h3>
              <p className="text-lg font-bold text-charcoal leading-relaxed">{data.working_hours || "Đang cập nhật..."}</p>
            </div>
          </div>
        </div>
        
        <Button asChild className="w-full btn-hero h-12 text-sm font-bold shadow-gold">
          <Link to="/lien-he">
            Liên Hệ Tư Vấn Ngay <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}