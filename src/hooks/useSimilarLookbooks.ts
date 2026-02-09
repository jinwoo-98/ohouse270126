import { useState, useEffect } from "react";
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

interface Lookbook {
  id: string;
  title: string;
  image_url: string;
  category_id: string;
  slug: string;
  shop_look_items: {
    id: string;
    x_position: number;
    y_position: number;
    target_image_url: string;
    products: Product;
  }[];
}

interface UseSimilarLookbooksResult {
  similarLookbooks: Lookbook[];
  isLoadingSimilarLooks: boolean;
}

export function useSimilarLookbooks(currentLookId: string, categoryId: string): UseSimilarLookbooksResult {
  const [similarLookbooks, setSimilarLookbooks] = useState<Lookbook[]>([]);
  const [isLoadingSimilarLooks, setIsLoadingSimilarLooks] = useState(true);

  useEffect(() => {
    if (!currentLookId || !categoryId) {
      setIsLoadingSimilarLooks(false);
      return;
    }

    const fetchSimilar = async () => {
      setIsLoadingSimilarLooks(true);
      try {
        const { data, error } = await supabase
          .from('shop_looks')
          .select(`
            id, 
            title, 
            image_url, 
            category_id,
            slug,
            shop_look_items(
              *,
              products(*)
            )
          `)
          .eq('category_id', categoryId)
          .neq('id', currentLookId)
          .limit(4);

        if (error) throw error;
        
        setSimilarLookbooks((data as unknown as Lookbook[]) || []);
      } catch (error) {
        console.error("Error fetching similar lookbooks:", error);
      } finally {
        setIsLoadingSimilarLooks(false);
      }
    };

    fetchSimilar();
  }, [currentLookId, categoryId]);

  return { similarLookbooks, isLoadingSimilarLooks };
}