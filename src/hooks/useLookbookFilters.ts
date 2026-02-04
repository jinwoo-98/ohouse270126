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
  
  const [fetchedFilterOptions, setFetchedFilterOptions] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<LookbookFilterState>({
    selectedCategorySlug: "all",
    selectedStyle: "all",
    selectedMaterial: "all",
    selectedColor: "all",
  });

  useEffect(() => {
    const fetchLooksAndFilters = async () => {
      setIsLoadingLooks(true);
      try {
        const [looksRes, filtersRes] = await Promise.all([
          supabase
            .from('shop_looks')
            .select(`
              *, 
              slug,
              shop_look_items(
                *, 
                products(
                  id, name, price, image_url, slug, category_id, is_sale, original_price
                )
              )
            `)
            .eq('is_active', true)
            .order('display_order'),
          supabase
            .from('lookbook_filters')
            .select('*')
            .order('type')
            .order('value')
        ]);
        
        if (looksRes.error) throw looksRes.error;
        if (filtersRes.error) throw filtersRes.error;
        
        setAllLooks(looksRes.data || []);
        setFetchedFilterOptions(filtersRes.data || []);
      } catch (e) {
        console.error("Error fetching lookbooks or filters:", e);
      } finally {
        setIsLoadingLooks(false);
      }
    };
    fetchLooksAndFilters();
  }, []);

  const filterOptions = useMemo(() => {
    const options: { categories: FilterOption[], styles: string[], materials: string[], colors: string[] } = {
      categories: [{ name: "Tất Cả Không Gian", slug: "all" }],
      styles: [],
      materials: [],
      colors: [],
    };

    if (categoriesData) {
      const lookCategories = new Set(allLooks.map(l => l.category_id).filter(Boolean));
      const availableCategories = categoriesData.mainCategories
        .filter(c => c.dropdownKey && lookCategories.has(c.dropdownKey))
        .map(c => ({ name: c.name, slug: c.dropdownKey! }));
      options.categories = [...options.categories, ...availableCategories];
    }

    fetchedFilterOptions.forEach(f => {
      if (f.type === 'style') options.styles.push(f.value);
      if (f.type === 'material') options.materials.push(f.value);
      if (f.type === 'color') options.colors.push(f.value);
    });
    
    options.styles.sort();
    options.materials.sort();
    options.colors.sort();

    return options;
  }, [allLooks, categoriesData, fetchedFilterOptions]);

  const filteredLooks = useMemo(() => {
    return allLooks.filter(look => {
      if (filters.selectedCategorySlug !== "all" && look.category_id !== filters.selectedCategorySlug) {
        return false;
      }
      if (filters.selectedStyle !== "all" && look.style !== filters.selectedStyle) {
        return false;
      }
      if (filters.selectedMaterial !== "all" && look.material !== filters.selectedMaterial) {
        return false;
      }
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