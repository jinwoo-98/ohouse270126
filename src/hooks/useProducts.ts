import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  priceRange: string[];
  materials: string[];
  styles: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  searchQuery?: string;
  saleOnly?: boolean;
}

const priceRangeMap: Record<string, [number, number]> = {
  "0-10": [0, 10000000],
  "10-20": [10000000, 20000000],
  "20-50": [20000000, 50000000],
  "50+": [50000000, 999999999],
};

export function useProducts(categorySlug: string, initialSearch?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [],
    materials: [],
    styles: [],
    sortBy: 'newest',
    searchQuery: initialSearch || '',
    saleOnly: categorySlug === 'sale',
  });

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, filters.sortBy, filters.saleOnly, filters.searchQuery, filters.materials, filters.styles, filters.priceRange]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('products').select('*');

      // 1. Lọc theo Danh mục
      const specialPages = ['noi-that', 'sale', 'moi', 'ban-chay'];
      if (!specialPages.includes(categorySlug)) {
        query = query.eq('category_id', categorySlug);
      }

      if (categorySlug === 'sale' || filters.saleOnly) {
        query = query.eq('is_sale', true);
      }
      if (categorySlug === 'moi') {
        query = query.eq('is_new', true);
      }

      // 2. Tìm kiếm
      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // 3. Lọc theo Chất liệu (nếu có chọn)
      if (filters.materials.length > 0) {
        query = query.in('material', filters.materials);
      }

      // 4. Lọc theo Phong cách (nếu có chọn)
      if (filters.styles.length > 0) {
        query = query.in('style', filters.styles);
      }

      // 5. Sắp xếp
      if (categorySlug === 'ban-chay') {
        query = query.order('fake_sold', { ascending: false });
      } else if (filters.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (filters.sortBy === 'popular') {
        query = query.order('fake_sold', { ascending: false });
      } else {
        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // 6. Lọc khoảng giá (Client-side vì logic phức tạp)
      let filteredData = data || [];
      if (filters.priceRange.length > 0) {
        filteredData = filteredData.filter(p => {
          return filters.priceRange.some(rangeKey => {
            const [min, max] = priceRangeMap[rangeKey];
            return p.price >= min && p.price <= max;
          });
        });
      }

      setProducts(filteredData);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [key]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...currentValues, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [],
      materials: [],
      styles: [],
      sortBy: 'newest',
      searchQuery: '',
      saleOnly: false,
    });
  };

  return {
    products,
    filters,
    updateFilters,
    toggleFilter,
    clearFilters,
    isLoading,
  };
}