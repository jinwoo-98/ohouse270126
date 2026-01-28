import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  priceRange: string[];
  materials: string[];
  styles: string[];
  sortBy: 'manual' | 'newest' | 'price-asc' | 'price-desc' | 'popular';
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
    sortBy: 'manual', // Mặc định là sắp xếp thủ công (display_order)
    searchQuery: initialSearch || '',
    saleOnly: categorySlug === 'sale',
  });

  // Fetch category default sort setting
  useEffect(() => {
    async function fetchDefaultSort() {
      if (['noi-that', 'sale', 'moi', 'ban-chay'].includes(categorySlug)) return;
      
      const { data } = await supabase
        .from('categories')
        .select('default_sort')
        .eq('slug', categorySlug)
        .single();
        
      if (data?.default_sort) {
        setFilters(prev => ({ ...prev, sortBy: data.default_sort as any }));
      }
    }
    fetchDefaultSort();
  }, [categorySlug]);

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, filters.sortBy, filters.saleOnly, filters.searchQuery, filters.materials, filters.styles, filters.priceRange]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('products').select('*');
      let targetSlugs = [categorySlug];

      // 1. Xử lý danh mục cha - con
      const specialPages = ['noi-that', 'sale', 'moi', 'ban-chay'];
      if (!specialPages.includes(categorySlug)) {
        // Kiểm tra xem đây có phải danh mục cha không
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, slug')
          .eq('slug', categorySlug)
          .single();

        if (categoryData) {
          // Tìm các danh mục con của nó
          const { data: children } = await supabase
            .from('categories')
            .select('slug')
            .eq('parent_id', categoryData.id);
          
          if (children && children.length > 0) {
            const childSlugs = children.map(c => c.slug);
            targetSlugs = [...targetSlugs, ...childSlugs];
          }
        }
        
        // Lọc sản phẩm thuộc danh sách slugs (cha hoặc con đều lấy được)
        query = query.in('category_id', targetSlugs);
      }

      // Các bộ lọc đặc biệt
      if (categorySlug === 'sale' || filters.saleOnly) {
        query = query.eq('is_sale', true);
      }
      if (categorySlug === 'moi') {
        query = query.eq('is_new', true);
      }
      if (categorySlug === 'ban-chay') {
        query = query.order('fake_sold', { ascending: false });
      }

      // 2. Tìm kiếm
      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // 3. Lọc thuộc tính
      if (filters.materials.length > 0) {
        query = query.in('material', filters.materials);
      }
      if (filters.styles.length > 0) {
        query = query.in('style', filters.styles);
      }

      // 4. Sắp xếp
      switch (filters.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('fake_sold', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'manual':
        default:
          // Sắp xếp theo display_order nhỏ nhất lên đầu (ưu tiên)
          query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      // 5. Lọc khoảng giá (Client-side)
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
      sortBy: 'manual',
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