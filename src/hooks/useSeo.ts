import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SeoData {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  url?: string;
}

export function useSeo(overrides?: SeoData) {
  const { data: globalSettings, isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_settings').select('*').single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const finalSeo = {
    title: overrides?.title || globalSettings?.meta_title || "OHOUSE - Nội Thất Cao Cấp",
    description: overrides?.description || globalSettings?.meta_description || "Thương hiệu nội thất cao cấp hàng đầu Việt Nam.",
    image: overrides?.image || globalSettings?.og_image_url || "/og-image.jpg",
    type: overrides?.type || 'website',
    url: overrides?.url || window.location.href,
    structuredData: globalSettings?.structured_data,
    favicon: globalSettings?.favicon_url
  };

  return { seo: finalSeo, isLoading };
}