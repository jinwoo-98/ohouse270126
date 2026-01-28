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
  }, [categorySlug, filters.sortBy, filters.saleOnly, filters.searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('products').select('*');

      // Filter by Category
      if (categorySlug !== 'noi-that' && categorySlug !== 'sale' && categorySlug !== 'moi' && categorySlug !== 'ban-chay') {
        // Simple mapping for demonstration
        query = query.eq('category_id', categorySlug);
      }

      // Filter by Search
      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // Filter by Sale
      if (filters.saleOnly || categorySlug === 'sale') {
        query = query.eq('is_sale', true);
      }

      // Sorting
      if (filters.sortBy === 'price-asc') query = query.order('price', { ascending: true });
      else if (filters.sortBy === 'price-desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Client side filtering for price (simpler for this demo)
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