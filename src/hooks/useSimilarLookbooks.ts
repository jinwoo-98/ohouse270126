import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Lookbook {
  id: string;
  title: string;
  image_url: string;
  category_id: string;
  // Cập nhật cấu trúc để khớp với select('shop_look_items(products(id))')
  shop_look_items: any[]; // Sử dụng any[] để tránh lỗi phức tạp khi ép kiểu
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
            shop_look_items(products(id))
          `)
          .eq('category_id', categorySlug)
          .eq('is_active', true)
          .neq('id', currentLookId) // Loại trừ Lookbook hiện tại
          .limit(4);

        if (error) throw error;
        // Ép kiểu dữ liệu trả về thành unknown trước khi chuyển sang Lookbook[]
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