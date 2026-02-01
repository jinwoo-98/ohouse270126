import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "./useCategories";

interface LookbookFilterState {
  selectedCategorySlug: string;
  selectedStyle: string;
  selectedMaterial: string;
  selectedColor: string; // Thêm bộ lọc Màu sắc
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
    selectedColor: "all", // Khởi tạo Màu sắc
  });

  // 1. Fetch all active Lookbooks
  useEffect(() => {
    const fetchLooks = async () => {
      setIsLoadingLooks(true);
      try {
        // Fetch lookbooks with nested product attributes to extract filter values
        const { data, error } = await supabase
          .from('shop_looks')
          .select(`
            *, 
            shop_look_items(
              *, 
              products(
                *, 
                product_attributes(value, attributes(name))
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

    // Styles, Materials, and Colors (Lấy từ các sản phẩm trong Lookbook)
    allLooks.forEach(look => {
      look.shop_look_items.forEach((item: any) => {
        if (item.products) {
          // Static fields
          if (item.products.style) uniqueStyles.add(item.products.style);
          if (item.products.material) uniqueMaterials.add(item.products.material);
          
          // Dynamic Attributes (Looking for 'Màu sắc' or 'Color')
          item.products.product_attributes?.forEach((pAttr: any) => {
            const attrName = pAttr.attributes?.name;
            if (attrName === 'Màu sắc' || attrName === 'Color') {
              const values = Array.isArray(pAttr.value) ? pAttr.value : [pAttr.value];
              values.forEach((v: string) => {
                if (v && typeof v === 'string') uniqueColors.add(v.trim());
              });
            }
          });
        }
      });
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

      let matchesStyle = filters.selectedStyle === "all";
      let matchesMaterial = filters.selectedMaterial === "all";
      let matchesColor = filters.selectedColor === "all";

      // Check if any product in the look matches ALL selected sub-filters (Style, Material, Color)
      const hasMatchingProduct = look.shop_look_items.some((item: any) => {
        if (!item.products) return false;
        
        // Check Style
        const productStyle = item.products.style;
        const styleMatch = filters.selectedStyle === "all" || productStyle === filters.selectedStyle;
        
        // Check Material
        const productMaterial = item.products.material;
        const materialMatch = filters.selectedMaterial === "all" || productMaterial === filters.selectedMaterial;
        
        // Check Color (Dynamic Attribute)
        let colorMatch = filters.selectedColor === "all";
        if (!colorMatch) {
          const colorAttr = item.products.product_attributes?.find((pAttr: any) => 
            pAttr.attributes?.name === 'Màu sắc' || pAttr.attributes?.name === 'Color'
          );
          if (colorAttr) {
            const values = Array.isArray(colorAttr.value) ? colorAttr.value : [colorAttr.value];
            if (values.some((v: string) => v === filters.selectedColor)) {
              colorMatch = true;
            }
          }
        }

        return styleMatch && materialMatch && colorMatch;
      });
      
      // If sub-filters are active, the look must contain at least one product matching all criteria
      if (filters.selectedStyle !== "all" || filters.selectedMaterial !== "all" || filters.selectedColor !== "all") {
          return hasMatchingProduct;
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