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
  slug: string; // THÊM SLUG
  // Cập nhật cấu trúc để khớp với select('shop_look_items(*)')
  shop_look_items: {
    id: string;
    x_position: number;
    y_position: number;
    target_image_url: string;
    products: Product; // Đảm bảo products được fetch
  }[];
}

interface UseSimilarLookbooksResult {
  similarLookbooks: Lookbook[];
  isLoadingSimilarLooks: boolean;
}

export function useSimilarLookbooks(currentLookId: string, categorySlug: string): UseSimilarLookbooksResult {
  const [similarLookbooks, setSimilarLookbooks] = useState<Lookbook[]>([]);
  const [isLoadingSimilarLooks, setIsLoadingSimilarLooks] = useState(true);

  useEffect(() => {
    if (!currentLookId || !categorySlug) {
      setIsLoadingSimilarLooks(false);
      return;
    }

    const fetchSimilar = async () => {
      setIsLoadingSimilarLooks(true);
      try {
        // Tìm các Lookbook khác trong cùng category_id
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
          `) // Lấy tất cả các trường của shop_look_items và products
          .eq('category_id', categorySlug)
          .eq('is_active', true)
          .neq('id', currentLookId) // Loại trừ Lookbook hiện tại
          .limit(4);

        if (error) throw error;
        // Ép kiểu dữ liệu trả về thành Lookbook[]
        setSimilarLookbooks(data as unknown as Lookbook[] || []);
      } catch (error) {
        console.error("Error fetching similar lookbooks:", error);
      } finally {
        setIsLoadingSimilarLooks(false);
      }
    };

    fetchSimilar();
  }, [currentLookId, categorySlug]);

  return { similarLookbooks, isLoadingSimilarLooks };
}