"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShowroomCard } from "./ShowroomCard"; // Import ShowroomCard

interface ShowroomData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  working_hours: string;
  map_iframe_url: string;
  image_url: string;
}

export function ShowroomContent() {
  const [showrooms, setShowrooms] = useState<ShowroomData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active showrooms ordered by display_order
      const { data, error } = await supabase
        .from('showrooms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setShowrooms(data || []);
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

  if (showrooms.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Chưa có Showroom nào đang hoạt động</h1>
        <p className="text-muted-foreground mt-4">Vui lòng thêm showroom trong trang quản trị.</p>
        <Button asChild className="mt-8"><Link to="/admin/showrooms">Quản lý Showroom</Link></Button>
      </div>
    );
  }

  // Hiển thị danh sách các showroom
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {showrooms.map((showroom, index) => (
        <ShowroomCard key={showroom.id} showroom={showroom} index={index} />
      ))}
      
      <div className="pt-8 border-t border-border/40">
        <Button asChild className="w-full btn-hero h-12 text-sm font-bold shadow-gold">
          <Link to="/lien-he">
            Liên Hệ Tư Vấn Ngay <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}