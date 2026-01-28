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
        .order('display_order', { ascending: true }); // Sắp xếp theo số thứ tự

      if (error) throw error;

      const categories = data || [];

      // 1. Lọc các liên kết cho Hàng 3 (secondary)
      const secondaryItems = categories
        .filter(c => c.menu_location === 'secondary' && !c.parent_id)
        .map(c => ({
          name: c.name,
          href: c.slug.startsWith('/') ? c.slug : `/${c.slug}`
        }));

      // 2. Lọc các liên kết cho Hàng 4 (main)
      const mainItems = categories.filter(c => c.menu_location === 'main' && !c.parent_id);
      
      // 3. Xây dựng bản đồ danh mục con
      const subItemsMap: Record<string, any[]> = {};
      
      categories.forEach(c => {
        if (c.parent_id) {
          const parent = categories.find(p => p.id === c.parent_id);
          if (parent) {
            if (!subItemsMap[parent.slug]) {
              subItemsMap[parent.slug] = [];
            }
            subItemsMap[parent.slug].push({
              name: c.name,
              href: c.slug.startsWith('/') ? c.slug : `/${c.slug}`
            });
          }
        }
      });

      return {
        secondaryLinks: secondaryItems,
        mainCategories: mainItems.map(c => ({
          name: c.name,
          href: c.slug.startsWith('/') ? c.slug : `/${c.slug}`,
          hasDropdown: categories.some(child => child.parent_id === c.id),
          dropdownKey: c.slug,
          isHighlight: c.is_highlight
        })),
        productCategories: subItemsMap
      };
    }
  });
}