import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCategories() {
  return useQuery({
    queryKey: ['categories-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (!data) return { mainCategories: [], productCategories: {} };

      // Lấy danh mục cha (không có parent_id)
      const mainItems = data.filter(c => !c.parent_id);
      
      // Tạo map danh mục con
      const subItemsMap: Record<string, any[]> = {};
      data.forEach(c => {
        if (c.parent_id) {
          const parent = data.find(p => p.id === c.parent_id);
          if (parent) {
            if (!subItemsMap[parent.slug]) subItemsMap[parent.slug] = [];
            subItemsMap[parent.slug].push({
              name: c.name,
              href: `/${c.slug}`
            });
          }
        }
      });

      return {
        mainCategories: mainItems.map(c => ({
          name: c.name,
          href: `/${c.slug}`,
          hasDropdown: data.some(child => child.parent_id === c.id),
          dropdownKey: c.slug,
          isHighlight: c.is_highlight
        })),
        productCategories: subItemsMap
      };
    }
  });
}