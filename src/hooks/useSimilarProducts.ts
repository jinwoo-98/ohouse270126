import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface UseSimilarProductsResult {
  similarProducts: Product[];
  isLoadingSimilar: boolean;
}

export function useSimilarProducts(categoryId: string, currentProductId: string, excludedIds: string[] = []): UseSimilarProductsResult {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);

  useEffect(() => {
    if (!categoryId || !currentProductId) {
      setIsLoadingSimilar(false);
      return;
    }

    const fetchSimilar = async () => {
      setIsLoadingSimilar(true);
      try {
        let query = supabase
          .from('products')
          .select('id, name, price, image_url, slug, category_id, is_sale, original_price')
          .eq('category_id', categoryId)
          .limit(8);

        // 1. Combine current product ID and explicitly excluded IDs
        const allExcludedIds = [currentProductId, ...excludedIds].filter(Boolean);
        
        if (allExcludedIds.length > 0) {
            // 2. Exclude all IDs already displayed in other sections or the current product itself
            query = query.not('id', 'in', `(${allExcludedIds.join(',')})`);
        }
        
        // 3. Order by fake_sold for better relevance
        query = query.order('fake_sold', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setSimilarProducts(data || []);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    // Re-fetch whenever categoryId, currentProductId, or the list of excludedIds changes
    fetchSimilar();
  }, [categoryId, currentProductId, excludedIds.join(',')]);

  return { similarProducts, isLoadingSimilar };
}