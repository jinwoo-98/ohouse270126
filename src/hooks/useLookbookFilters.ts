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

// Helper function to generate slug
const slugify = (text: string) => {
  if (!text) return '';
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

export function useLookbookFilters() {
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [isLoadingLooks, setIsLoadingLooks] = useState(true);
  
  // NEW STATE: Store fetched filter options
  const [fetchedFilterOptions, setFetchedFilterOptions] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<LookbookFilterState>({
    selectedCategorySlug: "all",
    selectedStyle: "all",
    selectedMaterial: "all",
    selectedColor: "all",
  });

  // 1. Fetch all active Lookbooks AND Filter Options
  useEffect(() => {
    const fetchLooksAndFilters = async () => {
      setIsLoadingLooks(true);
      try {
        const [looksRes, filtersRes] = await Promise.all([
          supabase
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
            .order('display_order'),
          // Fetch filter options from the new table
          supabase
            .from('lookbook_filters')
            .select('*')
            .order('type')
            .order('value')
        ]);
        
        if (looksRes.error) throw looksRes.error;
        if (filtersRes.error) throw filtersRes.error;
        
        // **FIX: Ensure slug exists for every look**
        const processedLooks = (looksRes.data || []).map(look => ({
          ...look,
          slug: look.slug || slugify(look.title)
        }));
        setAllLooks(processedLooks);
        setFetchedFilterOptions(filtersRes.data || []); // Set fetched options
      } catch (e) {
        console.error("Error fetching lookbooks or filters:", e);
      } finally {
        setIsLoadingLooks(false);
      }
    };
    fetchLooksAndFilters();
  }, []);

  // 2. Determine available filter options (Categories, Styles, Materials, Colors)
  const filterOptions = useMemo(() => {
    const options: { categories: FilterOption[], styles: string[], materials: string[], colors: string[] } = {
      categories: [{ name: "Tất Cả Không Gian", slug: "all" }],
      styles: [],
      materials: [],
      colors: [],
    };

    if (categoriesData) {
      // Categories (Phòng) - Filter categories that actually have looks assigned
      const lookCategories = new Set(allLooks.map(l => l.category_id).filter(Boolean));
      const availableCategories = categoriesData.mainCategories
        .filter(c => c.dropdownKey && lookCategories.has(c.dropdownKey))
        .map(c => ({ name: c.name, slug: c.dropdownKey! }));
      options.categories = [...options.categories, ...availableCategories];
    }

    // Styles, Materials, and Colors (Lấy từ bảng lookbook_filters)
    fetchedFilterOptions.forEach(f => {
      if (f.type === 'style') options.styles.push(f.value);
      if (f.type === 'material') options.materials.push(f.value);
      if (f.type === 'color') options.colors.push(f.value);
    });
    
    // Sort the options fetched from the table
    options.styles.sort();
    options.materials.sort();
    options.colors.sort();

    return options;
  }, [allLooks, categoriesData, fetchedFilterOptions]); // Depend on fetchedFilterOptions

  // 3. Filtered Looks (remains the same)
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