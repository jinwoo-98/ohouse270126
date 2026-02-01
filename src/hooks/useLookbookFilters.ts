import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "./useCategories";

interface LookbookFilterState {
  selectedCategorySlug: string;
  selectedStyle: string;
  selectedMaterial: string;
  selectedColor: string;
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
    selectedColor: "all",
  });

  // 1. Fetch all active Lookbooks
  useEffect(() => {
    const fetchLooks = async () => {
      setIsLoadingLooks(true);
      try {
        // Fetch lookbooks including the new filter fields
        const { data, error } = await supabase
          .from('shop_looks')
          .select(`
            *, 
            shop_look_items(
              *, 
              products(
                id, name, price, image_url, slug, category_id, is_sale, original_price
              )
            )
          `)
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

  // 2. Determine available filter options (Categories, Styles, Materials, Colors)
  const filterOptions = useMemo(() => {
    const options: { categories: FilterOption[], styles: string[], materials: string[], colors: string[] } = {
      categories: [{ name: "Tất Cả Không Gian", slug: "all" }],
      styles: [],
      materials: [],
      colors: [],
    };

    const uniqueStyles = new Set<string>();
    const uniqueMaterials = new Set<string>();
    const uniqueColors = new Set<string>();

    if (categoriesData) {
      // Categories (Phòng)
      const lookCategories = new Set(allLooks.map(l => l.category_id).filter(Boolean));
      const availableCategories = categoriesData.mainCategories
        .filter(c => c.dropdownKey && lookCategories.has(c.dropdownKey))
        .map(c => ({ name: c.name, slug: c.dropdownKey! }));
      options.categories = [...options.categories, ...availableCategories];
    }

    // Styles, Materials, and Colors (Lấy trực tiếp từ Lookbook)
    allLooks.forEach(look => {
      if (look.style) uniqueStyles.add(look.style.trim());
      if (look.material) uniqueMaterials.add(look.material.trim());
      if (look.color) uniqueColors.add(look.color.trim());
    });

    options.styles = Array.from(uniqueStyles).filter(s => s && s.trim() !== '').sort();
    options.materials = Array.from(uniqueMaterials).filter(m => m && m.trim() !== '').sort();
    options.colors = Array.from(uniqueColors).filter(c => c && c.trim() !== '').sort();

    return options;
  }, [allLooks, categoriesData]);

  // 3. Filtered Looks
  const filteredLooks = useMemo(() => {
    return allLooks.filter(look => {
      // Filter by Category (Phòng)
      if (filters.selectedCategorySlug !== "all" && look.category_id !== filters.selectedCategorySlug) {
        return false;
      }

      // Filter by Style
      if (filters.selectedStyle !== "all" && look.style !== filters.selectedStyle) {
        return false;
      }
      
      // Filter by Material
      if (filters.selectedMaterial !== "all" && look.material !== filters.selectedMaterial) {
        return false;
      }
      
      // Filter by Color
      if (filters.selectedColor !== "all" && look.color !== filters.selectedColor) {
        return false;
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