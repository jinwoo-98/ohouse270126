-- Add the missing 'slug' column to the shop_looks table
ALTER TABLE public.shop_looks
ADD COLUMN slug TEXT;

-- Add a unique constraint to prevent duplicate slugs, which is good for SEO and routing
ALTER TABLE public.shop_looks
ADD CONSTRAINT shop_looks_slug_key UNIQUE (slug);