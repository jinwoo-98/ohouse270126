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

export function useSimilarProducts(categoryId: string, currentProductId: string): UseSimilarProductsResult {
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
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, slug, category_id, is_sale, original_price')
          .eq('category_id', categoryId)
          .neq('id', currentProductId)
          .limit(8);

        if (error) throw error;
        setSimilarProducts(data || []);
      } catch (error) {
        console.error("Error fetching similar products:", error);
        // toast.error("Lỗi tải sản phẩm tương tự."); // Suppress toast for background fetch
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [categoryId, currentProductId]);

  return { similarProducts, isLoadingSimilar };
}