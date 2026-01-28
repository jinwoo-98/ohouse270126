import { useState, useMemo } from "react";
import { ALL_PRODUCTS, Product } from "@/constants/products";

interface Filters {
  priceRange: string[];
  materials: string[];
  styles: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  searchQuery?: string;
  saleOnly?: boolean;
}

const categoryMap: Record<string, string[]> = {
  "phong-khach": ["ke-tivi", "sofa", "ban-tra", "den-trang-tri"],
  "phong-ngu": ["giuong", "phong-ngu"],
  "phong-an": ["ban-an"],
  "sale": ALL_PRODUCTS.filter(p => p.isSale).map(p => p.categorySlug),
};

const priceRangeMap: Record<string, [number, number]> = {
  "0-10": [0, 10000000],
  "10-20": [10000000, 20000000],
  "20-50": [20000000, 50000000],
  "50+": [50000000, Infinity],
};

export function useProducts(slug: string, initialSearch?: string) {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [],
    materials: [],
    styles: [],
    sortBy: 'newest',
    searchQuery: initialSearch || '',
    saleOnly: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const rawProducts = useMemo(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);

    let result = [...ALL_PRODUCTS];

    if (slug !== "noi-that") {
      const targetSlugs = categoryMap[slug] || [slug];
      result = result.filter(p => targetSlugs.includes(p.categorySlug) || slug === p.categorySlug);
    }

    return result;
  }, [slug]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...rawProducts];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.material.toLowerCase().includes(query)
      );
    }

    if (filters.saleOnly) {
      result = result.filter(p => p.isSale);
    }

    if (filters.priceRange.length > 0) {
      result = result.filter(product => {
        return filters.priceRange.some(rangeKey => {
          const [min, max] = priceRangeMap[rangeKey];
          return product.price >= min && product.price < max;
        });
      });
    }

    if (filters.materials.length > 0) {
      result = result.filter(product => filters.materials.includes(product.material));
    }

    if (filters.styles.length > 0) {
      result = result.filter(product => filters.styles.includes(product.style));
    }

    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        result.sort(() => Math.random() - 0.5);
        break;
    }

    return result;
  }, [rawProducts, filters]);

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
    products: filteredAndSortedProducts,
    filters,
    updateFilters,
    toggleFilter,
    clearFilters,
    isLoading,
  };
}