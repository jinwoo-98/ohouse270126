"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShowroomPageLinkProps {
  children: React.ReactNode;
  className?: string;
}

export function ShowroomPageLink({ children, className }: ShowroomPageLinkProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_pages')
        .select('id')
        .eq('slug', 'showroom')
        .single();

      if (error || !data) {
        toast.error("Không tìm thấy trang Showroom. Vui lòng kiểm tra lại mục Quản lý Trang.");
        navigate("/admin/pages");
        return;
      }
      
      navigate(`/admin/pages/edit/${data.id}`);
    } catch (e) {
      toast.error("Lỗi hệ thống khi tìm trang.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : children}
    </button>
  );
}