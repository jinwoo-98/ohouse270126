import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  category_id: string;
  is_sale: boolean;
  original_price: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface UseLookbookSimilarProductsResult {
  similarProducts: Product[];
  categories: Category[];
  isLoading: boolean;
  setActiveCategorySlug: (slug: string) => void;
  activeCategorySlug: string;
}

export function useLookbookSimilarProducts(lookbookProducts: Product[]): UseLookbookSimilarProductsResult {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');

  // 1. Xác định các danh mục duy nhất từ các sản phẩm trong Lookbook
  const uniqueCategorySlugs = useMemo(() => {
    const slugs = new Set(lookbookProducts.map(p => p.category_id).filter(Boolean));
    return Array.from(slugs);
  }, [lookbookProducts]);

  // 2. Fetch chi tiết các danh mục
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    async function fetchCategories() {
      if (uniqueCategorySlugs.length === 0) {
        setCategories([]);
        return;
      }
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .in('slug', uniqueCategorySlugs);
      setCategories(data || []);
    }
    fetchCategories();
  }, [uniqueCategorySlugs]);

  // 3. Fetch sản phẩm tương tự dựa trên danh mục đang hoạt động
  useEffect(() => {
    async function fetchSimilar() {
      if (lookbookProducts.length === 0) {
        setSimilarProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      let query = supabase
        .from('products')
        .select('id, name, price, image_url, slug, category_id, is_sale, original_price')
        .limit(12);

      // Lấy ID của các sản phẩm trong Lookbook để loại trừ
      const lookbookProductIds = lookbookProducts.map(p => p.id).filter(Boolean);
      
      // Loại trừ các sản phẩm đã có trong Lookbook
      if (lookbookProductIds.length > 0) {
        // Sử dụng .not('id', 'in', '(...)' )
        query = query.not('id', 'in', `(${lookbookProductIds.join(',')})`);
      }

      if (activeCategorySlug === 'all') {
        // Lấy sản phẩm tương tự từ TẤT CẢ các danh mục có trong Lookbook
        query = query.in('category_id', uniqueCategorySlugs);
      } else {
        // Lấy sản phẩm tương tự từ danh mục đang được chọn
        query = query.eq('category_id', activeCategorySlug);
      }
      
      // Sắp xếp theo lượt bán ảo để ưu tiên sản phẩm phổ biến
      query = query.order('fake_sold', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching similar products:", error);
      }
      setSimilarProducts(data || []);
      setIsLoading(false);
    }
    fetchSimilar();
  }, [activeCategorySlug, lookbookProducts]);

  return {
    similarProducts,
    categories,
    isLoading,
    setActiveCategorySlug,
    activeCategorySlug,
  };
}