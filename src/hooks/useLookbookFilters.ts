import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "./useCategories";

interface LookbookFilterState {
  selectedCategorySlug: string;
  selectedStyle: string;
  selectedMaterial: string;
}

interface FilterOption {
  name: string;
  slug: string;
}

export function useLookbookFilters() {
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [isLoadingLooks, setIsLoadingLooks] = useState(true);
  
  const [filters, setFilters] = useState<LookbookFilterState>({
    selectedCategorySlug: "all",
    selectedStyle: "all",
    selectedMaterial: "all",
  });

  // 1. Fetch all active Lookbooks
  useEffect(() => {
    const fetchLooks = async () => {
      setIsLoadingLooks(true);
      try {
        const { data, error } = await supabase
          .from('shop_looks')
          .select('*, shop_look_items(*, products(*))')
          .eq('is_active', true)
          .order('display_order');
        
        if (error) throw error;
        setAllLooks(data || []);
      } catch (e) {
        console.error("Error fetching lookbooks:", e);
      } finally {
        setIsLoadingLooks(false);
      }
    };
    fetchLooks();
  }, []);

  // 2. Determine available filter options (Categories, Styles, Materials)
  const filterOptions = useMemo(() => {
    const options: { categories: FilterOption[], styles: string[], materials: string[] } = {
      categories: [{ name: "Tất Cả Không Gian", slug: "all" }],
      styles: [],
      materials: [],
    };

    if (categoriesData) {
      // Categories (Phòng)
      const lookCategories = new Set(allLooks.map(l => l.category_id).filter(Boolean));
      const availableCategories = categoriesData.mainCategories
        .filter(c => c.dropdownKey && lookCategories.has(c.dropdownKey))
        .map(c => ({ name: c.name, slug: c.dropdownKey! }));
      options.categories = [...options.categories, ...availableCategories];
    }

    // Styles and Materials (Lấy từ các sản phẩm trong Lookbook)
    const uniqueStyles = new Set<string>();
    const uniqueMaterials = new Set<string>();

    allLooks.forEach(look => {
      look.shop_look_items.forEach((item: any) => {
        if (item.products) {
          if (item.products.style) uniqueStyles.add(item.products.style);
          if (item.products.material) uniqueMaterials.add(item.products.material);
        }
      });
    });

    options.styles = Array.from(uniqueStyles).filter(s => s && s.trim() !== '').sort();
    options.materials = Array.from(uniqueMaterials).filter(m => m && m.trim() !== '').sort();

    return options;
  }, [allLooks, categoriesData]);

  // 3. Filtered Looks
  const filteredLooks = useMemo(() => {
    return allLooks.filter(look => {
      // Filter by Category (Phòng)
      if (filters.selectedCategorySlug !== "all" && look.category_id !== filters.selectedCategorySlug) {
        return false;
      }

      // Filter by Style (Phong cách)
      if (filters.selectedStyle !== "all") {
        const matchesStyle = look.shop_look_items.some((item: any) => 
          item.products && item.products.style === filters.selectedStyle
        );
        if (!matchesStyle) return false;
      }

      // Filter by Material (Chất liệu)
      if (filters.selectedMaterial !== "all") {
        const matchesMaterial = look.shop_look_items.some((item: any) => 
          item.products && item.products.material === filters.selectedMaterial
        );
        if (!matchesMaterial) return false;
      }

      return true;
    });
  }, [allLooks, filters]);

  const updateFilter = (key: keyof LookbookFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filteredLooks,
    filterOptions,
    filters,
    updateFilter,
    isLoading: isLoadingCategories || isLoadingLooks,
  };
}