"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Home, Layers, Palette, Zap, Loader2 } from "lucide-react";
import { useLookbookFilters } from "@/hooks/useLookbookFilters";
import { cn } from "@/lib/utils";

export function LookbookCTAFilters() {
  const navigate = useNavigate();
  const { filterOptions, isLoading } = useLookbookFilters();
  
  const [selectedFilters, setSelectedFilters] = useState({
    category: "all",
    style: "all",
    color: "all",
  });

  const handleFilterChange = (key: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewLooks = () => {
    const params = new URLSearchParams();
    if (selectedFilters.category !== 'all') params.set('category', selectedFilters.category);
    if (selectedFilters.style !== 'all') params.set('style', selectedFilters.style);
    if (selectedFilters.color !== 'all') params.set('color', selectedFilters.color);
    
    // Chuyển hướng đến trang Cảm hứng với các query params
    navigate(`/cam-hung?${params.toString()}`);
  };

  const isAnyFilterSelected = useMemo(() => 
    Object.values(selectedFilters).some(v => v !== 'all'),
    [selectedFilters]
  );

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container-luxury max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-charcoal">Bạn đang tìm kiếm thứ khác?</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-lg font-medium text-charcoal">
            
            <span className="hidden sm:inline">Cho tôi xem</span>
            
            {/* 1. Category Filter (Phòng) */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border/60 shadow-sm">
              <Home className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedFilters.category} onValueChange={(val) => handleFilterChange('category', val)}>
                <SelectTrigger className="w-32 h-8 border-none bg-transparent text-sm font-bold focus:ring-0">
                  <SelectValue placeholder="Phòng" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-elevated">
                  <SelectItem value="all">Phòng (Tất cả)</SelectItem>
                  {filterOptions.categories.filter((c: any) => c.slug !== 'all').map((cat: any) => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <span className="hidden sm:inline">với</span>
            
            {/* 2. Style Filter (Phong cách) */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border/60 shadow-sm">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedFilters.style} onValueChange={(val) => handleFilterChange('style', val)}>
                <SelectTrigger className="w-32 h-8 border-none bg-transparent text-sm font-bold focus:ring-0">
                  <SelectValue placeholder="Phong cách" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-elevated">
                  <SelectItem value="all">Phong cách (Tất cả)</SelectItem>
                  {filterOptions.styles.map((style: string) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <span className="hidden sm:inline">sử dụng</span>
            
            {/* 3. Color Filter (Màu sắc) */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border/60 shadow-sm">
              <Palette className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedFilters.color} onValueChange={(val) => handleFilterChange('color', val)}>
                <SelectTrigger className="w-32 h-8 border-none bg-transparent text-sm font-bold focus:ring-0">
                  <SelectValue placeholder="Màu sắc" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-elevated">
                  <SelectItem value="all">Màu sắc (Tất cả)</SelectItem>
                  {filterOptions.colors.map((color: string) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleViewLooks}
            className={cn(
              "btn-hero h-12 px-10 rounded-2xl shadow-gold mt-8 text-sm font-bold",
              !isAnyFilterSelected && "opacity-70"
            )}
          >
            Xem Ngay <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}