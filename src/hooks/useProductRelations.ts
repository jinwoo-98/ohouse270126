import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductRelation {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  category_id: string;
  is_sale: boolean;
  original_price: number;
}

interface UseProductRelationsResult {
  perfectMatch: ProductRelation[];
  boughtTogether: ProductRelation[];
  isLoadingRelations: boolean;
}

export function useProductRelations(productId: string, categoryId: string, perfectMatchIds: string[], boughtTogetherIds: string[]): UseProductRelationsResult {
  const [perfectMatch, setPerfectMatch] = useState<ProductRelation[]>([]);
  const [boughtTogether, setBoughtTogether] = useState<ProductRelation[]>([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(true);

  useEffect(() => {
    if (!productId) return;
    
    setIsLoadingRelations(true);
    
    const fetchProductsByIds = async (ids: string[], fallbackCategory: string, currentProductId: string) => {
      if (ids && ids.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('id, name, price, image_url, slug, category_id, is_sale, original_price')
          .in('id', ids);
        
        if (data && data.length > 0) {
          return data;
        }
      }
      
      // Fallback logic: Get similar products from the same category or featured products
      let query = supabase
        .from('products')
        .select('id, name, price, image_url, slug, category_id, is_sale, original_price')
        .neq('id', currentProductId)
        .limit(8);
        
      if (fallbackCategory && fallbackCategory !== 'all') {
        query = query.eq('category_id', fallbackCategory);
      } else {
        query = query.eq('is_featured', true);
      }
      
      const { data } = await query;
      return data || [];
    };

    const loadRelations = async () => {
      try {
        const [matchData, boughtData] = await Promise.all([
          fetchProductsByIds(perfectMatchIds, categoryId, productId),
          fetchProductsByIds(boughtTogetherIds, 'all', productId), // Bought Together uses 'all' or featured as fallback
        ]);
        
        setPerfectMatch(matchData);
        setBoughtTogether(boughtData);
      } catch (error) {
        console.error("Error fetching product relations:", error);
        toast.error("Lỗi tải sản phẩm liên quan.");
      } finally {
        setIsLoadingRelations(false);
      }
    };

    loadRelations();
  }, [productId, categoryId, perfectMatchIds.join(','), boughtTogetherIds.join(',')]);

  return { perfectMatch, boughtTogether, isLoadingRelations };
}