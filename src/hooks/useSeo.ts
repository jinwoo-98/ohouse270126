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
    queryKey: ['site-settings-seo'],
    queryFn: async () => {
      // Sửa tên bảng từ seo_settings thành site_settings
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (error) {
        console.warn("Could not fetch site settings for SEO, using defaults.", error);
        return null;
      }
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const currentUrl = window.location.origin + window.location.pathname;

  const finalSeo = {
    title: overrides?.title || globalSettings?.meta_title || "OHOUSE - Nội Thất Cao Cấp",
    description: overrides?.description || globalSettings?.meta_description || "Thương hiệu nội thất cao cấp hàng đầu Việt Nam.",
    image: overrides?.image || globalSettings?.og_image_url || "/og-image.jpg",
    type: overrides?.type || 'website',
    url: overrides?.url || currentUrl,
    canonical: currentUrl,
    structuredData: globalSettings?.structured_data,
    favicon: globalSettings?.favicon_url
  };

  return { seo: finalSeo, isLoading };
}