ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS moit_logo_url TEXT;
NOTIFY pgrst, 'reload schema';