import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "./useCategories";
import { useSearchParams } from "react-router-dom";

interface LookbookFilterState {
  selectedCategorySlug: string;
  selectedStyle: string[]; // Thay đổi thành mảng
  selectedMaterial: string[]; // Thay đổi thành mảng
  selectedColor: string[]; // Thay đổi thành mảng
}

interface FilterOption {
  name: string;
  id: string;
  slug: string;
}

export function useLookbookFilters() {
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const [allLooks, setAllLooks] = useState<any[]>([]);
  const [isLoadingLooks, setIsLoadingLooks] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [fetchedFilterOptions, setFetchedFilterOptions] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<LookbookFilterState>({
    selectedCategorySlug: "all",
    selectedStyle: [],
    selectedMaterial: [],
    selectedColor: [],
  });

  // Helper để chuyển đổi giá trị từ URL (có thể là chuỗi 'val1,val2' hoặc 'val') thành mảng
  const parseUrlParam = (param: string | null): string[] => {
    if (!param) return [];
    return param.split(',').filter(v => v.trim() !== '');
  };

  // Sync filters with URL params on initial load
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    const style = parseUrlParam(searchParams.get('style'));
    const material = parseUrlParam(searchParams.get('material'));
    const color = parseUrlParam(searchParams.get('color'));
    
    setFilters({
      selectedCategorySlug: categorySlug || "all",
      selectedStyle: style,
      selectedMaterial: material,
      selectedColor: color,
    });
  }, [searchParams]);

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
            .eq('is_active', true) // Chỉ lấy lookbook đang hoạt động
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
      categories: [{ name: "Tất Cả Không Gian", id: "all", slug: "all" }],
      styles: [],
      materials: [],
      colors: [],
    };

    if (categoriesData?.allCategories && allLooks.length > 0) {
      const lookCategoryIds = new Set(allLooks.map(l => l.category_id).filter(Boolean));
      
      const availableCategories = categoriesData.allCategories
        .filter((c: any) => lookCategoryIds.has(c.id))
        .map((c: any) => ({ name: c.name, id: c.id, slug: c.slug }));

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
      // 1. Category Filter (Single Select)
      if (filters.selectedCategorySlug !== "all") {
        const selectedCategory = categoriesData?.allCategories.find((c: any) => c.slug === filters.selectedCategorySlug);
        if (!selectedCategory) return false;

        const targetCategoryIds = [selectedCategory.id];
        const children = categoriesData?.allCategories.filter((c: any) => c.parent_id === selectedCategory.id);
        if (children) {
            children.forEach((child: any) => targetCategoryIds.push(child.id));
        }

        if (!targetCategoryIds.includes(look.category_id)) {
            return false;
        }
      }
      
      // 2. Style Filter (Multi Select)
      if (filters.selectedStyle.length > 0 && !filters.selectedStyle.includes(look.style)) {
        return false;
      }
      
      // 3. Material Filter (Multi Select)
      if (filters.selectedMaterial.length > 0 && !filters.selectedMaterial.includes(look.material)) {
        return false;
      }
      
      // 4. Color Filter (Multi Select)
      if (filters.selectedColor.length > 0 && !filters.selectedColor.includes(look.color)) {
        return false;
      }
      
      return true;
    });
  }, [allLooks, filters, categoriesData?.allCategories]);

  const updateFilter = (key: keyof LookbookFilterState, value: string | string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Cập nhật URL params
      const newParams = new URLSearchParams(searchParams);
      
      if (key === 'selectedCategorySlug') {
        if (value === 'all') newParams.delete('category');
        else newParams.set('category', value as string);
      } else {
        const stringValue = Array.isArray(value) ? value.join(',') : value;
        const paramKey = key.replace('selected', '').toLowerCase();
        if (!stringValue || stringValue === 'all') newParams.delete(paramKey);
        else newParams.set(paramKey, stringValue);
      }
      
      setSearchParams(newParams, { replace: true });
      return newFilters;
    });
  };

  return {
    filteredLooks,
    filterOptions,
    filters,
    updateFilter,
    isLoading: isLoadingCategories || isLoadingLooks,
  };
}