import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  priceRange: string[];
  materials: string[]; // Keep for backward compatibility or static usage
  styles: string[];    // Keep for backward compatibility or static usage
  sortBy: 'manual' | 'newest' | 'price-asc' | 'price-desc' | 'popular';
  searchQuery?: string;
  saleOnly?: boolean;
  dynamicAttributes: Record<string, string[]>; // New dynamic filters: { [Attribute Name]: [Selected Values] }
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
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<Filters>({
    priceRange: [],
    materials: [],
    styles: [],
    sortBy: 'manual',
    searchQuery: initialSearch || '',
    saleOnly: categorySlug === 'sale',
    dynamicAttributes: {}
  });

  // 1. Fetch Category Details & Attributes
  useEffect(() => {
    async function fetchCategoryInfo() {
      const specialPages = ['noi-that', 'sale', 'moi', 'ban-chay', 'tim-kiem'];
      if (specialPages.includes(categorySlug)) {
        setCurrentCategory(null);
        setCategoryAttributes([]);
        return;
      }

      // Get Category Info
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
      
      if (!catData) return;
      setCurrentCategory(catData);

      // Set default sort if configured
      if (catData.default_sort) {
        setFilters(prev => ({ ...prev, sortBy: catData.default_sort as any }));
      }

      // Logic to fetch attributes:
      // If Parent: need attributes of children (aggregate) OR simple approach: get attributes linked to this category + its children
      // To simplify: We find attributes linked to this category ID and any children IDs
      const { data: children } = await supabase.from('categories').select('id').eq('parent_id', catData.id);
      const categoryIds = [catData.id, ...(children?.map(c => c.id) || [])];

      const { data: links } = await supabase
        .from('category_attributes')
        .select('attribute_id')
        .in('category_id', categoryIds);
      
      if (links && links.length > 0) {
        // Dedup attribute IDs
        const uniqueAttrIds = Array.from(new Set(links.map(l => l.attribute_id)));
        
        const { data: attrs } = await supabase
          .from('attributes')
          .select('*')
          .in('id', uniqueAttrIds)
          .order('name');
        
        setCategoryAttributes(attrs || []);
      } else {
        setCategoryAttributes([]);
      }
    }
    fetchCategoryInfo();
  }, [categorySlug]);

  // 2. Fetch Products
  useEffect(() => {
    fetchProducts();
  }, [categorySlug, filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('products').select('*');
      let targetSlugs = [categorySlug];

      // --- Category Filter Logic ---
      const specialPages = ['noi-that', 'sale', 'moi', 'ban-chay', 'tim-kiem'];
      if (!specialPages.includes(categorySlug)) {
        // If we already fetched category data, use it, otherwise fetch
        let catId = currentCategory?.id;
        
        if (!catId) {
           const { data } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
           catId = data?.id;
        }

        if (catId) {
          const { data: children } = await supabase.from('categories').select('slug').eq('parent_id', catId);
          if (children && children.length > 0) {
            targetSlugs = [...targetSlugs, ...children.map(c => c.slug)];
          }
        }
        
        query = query.in('category_id', targetSlugs);
      }

      // --- Basic Filters ---
      if (categorySlug === 'sale' || filters.saleOnly) query = query.eq('is_sale', true);
      if (categorySlug === 'moi') query = query.eq('is_new', true);
      if (categorySlug === 'ban-chay') query = query.order('fake_sold', { ascending: false });
      if (filters.searchQuery) query = query.ilike('name', `%${filters.searchQuery}%`);

      // --- Legacy Static Filters ---
      if (filters.materials.length > 0) query = query.in('material', filters.materials);
      if (filters.styles.length > 0) query = query.in('style', filters.styles);

      // --- Dynamic Attributes Filter (Complex) ---
      // We need to fetch product_attributes to filter IDs first if dynamic attributes are selected
      const activeDynamicFilters = Object.entries(filters.dynamicAttributes).filter(([_, values]) => values.length > 0);
      
      if (activeDynamicFilters.length > 0) {
        // Need to find product_ids that have specific attributes
        // This is tricky in Supabase basic client. Better to do it in two steps or Edge Function.
        // Client-side filtering approach for MVP (Fetch filtered by Cat first, then refine)
        // OR: Two-step fetch
        
        // Let's perform a subquery approach via product_attributes
        // Find all product IDs that match the criteria
        
        // This logic is simplified: get products that match ANY of the attributes? No, usually AND between attributes, OR between values.
        // e.g. Color IN (Red, Blue) AND Material IN (Wood)
        
        // Since Supabase join filtering is limited, we might fetch potential products first then filter in memory if the dataset is small (< 1000 per cat)
        // Or filter by finding IDs first.
        
        // Let's proceed with fetching products based on category/price/sort first, then filter in-memory for attributes.
      }

      // --- Sort ---
      switch (filters.sortBy) {
        case 'price-asc': query = query.order('price', { ascending: true }); break;
        case 'price-desc': query = query.order('price', { ascending: false }); break;
        case 'popular': query = query.order('fake_sold', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'manual': default: query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false }); break;
      }

      const { data, error } = await query;
      if (error) throw error;

      // --- In-Memory Filtering (Price & Dynamic Attributes) ---
      let filteredData = data || [];

      // 1. Price Range
      if (filters.priceRange.length > 0) {
        filteredData = filteredData.filter(p => {
          return filters.priceRange.some(rangeKey => {
            const [min, max] = priceRangeMap[rangeKey];
            return p.price >= min && p.price <= max;
          });
        });
      }

      // 2. Dynamic Attributes
      if (activeDynamicFilters.length > 0) {
        // Need to fetch attributes for these products to check
        const productIds = filteredData.map(p => p.id);
        if (productIds.length > 0) {
          const { data: pAttrs } = await supabase
            .from('product_attributes')
            .select('product_id, attribute_id, value')
            .in('product_id', productIds);
          
          const pAttrMap = new Map<string, Record<string, string[]>>(); // productId -> { attrId: [values] }
          
          pAttrs?.forEach(row => {
            const pid = row.product_id;
            if (!pAttrMap.has(pid)) pAttrMap.set(pid, {});
            
            // value can be string or array (jsonb)
            let vals: string[] = [];
            if (Array.isArray(row.value)) vals = row.value;
            else if (typeof row.value === 'string') vals = [row.value];
            
            pAttrMap.get(pid)![row.attribute_id] = vals;
          });

          // Filter Logic: product must satisfy ALL active attributes
          filteredData = filteredData.filter(p => {
            const pAttributes = pAttrMap.get(p.id);
            if (!pAttributes) return false;

            return activeDynamicFilters.every(([attrName, selectedValues]) => {
              // Find attrId from name (we stored name in keys? No, better use ID in keys)
              // Actually, UI passes Attribute Name as key currently in filters.dynamicAttributes?
              // Let's fix that. filters.dynamicAttributes should be keyed by Name for display simplicity or we map it.
              // Use Name matching for simplicity with current structure
              
              // Find the attribute ID that corresponds to this filter name
              const targetAttr = categoryAttributes.find(a => a.name === attrName);
              if (!targetAttr) return true; // Should not happen

              const productValues = pAttributes[targetAttr.id];
              if (!productValues) return false;

              // Check if product has ANY of the selected values for this attribute
              return selectedValues.some(val => productValues.includes(val));
            });
          });
        }
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

  const toggleDynamicFilter = (attrName: string, value: string) => {
    setFilters(prev => {
      const currentAttrValues = prev.dynamicAttributes[attrName] || [];
      const newValues = currentAttrValues.includes(value)
        ? currentAttrValues.filter(v => v !== value)
        : [...currentAttrValues, value];
      
      return {
        ...prev,
        dynamicAttributes: {
          ...prev.dynamicAttributes,
          [attrName]: newValues
        }
      };
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
      dynamicAttributes: {}
    });
  };

  return {
    products,
    filters,
    categoryAttributes,
    currentCategory,
    updateFilters,
    toggleFilter,
    toggleDynamicFilter,
    clearFilters,
    isLoading,
  };
}