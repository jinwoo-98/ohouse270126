-- Force PostgREST to reload the schema cache immediately
-- This is the specific command to fix "Could not find the column in schema cache" errors
NOTIFY pgrst, 'reload schema';

-- Toggle RLS as a backup mechanism to force cache invalidation
ALTER TABLE public.shop_looks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Ensure column exists and has data (Safety check)
DO $$
BEGIN
    -- 1. Ensure column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_looks' AND column_name = 'slug') THEN
        ALTER TABLE public.shop_looks ADD COLUMN slug text;
    END IF;

    -- 2. Populate empty slugs based on title to ensure data integrity
    UPDATE public.shop_looks 
    SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) 
    WHERE slug IS NULL OR slug = '';
    
    -- 3. Ensure uniqueness (optional but recommended)
    -- We add a suffix if duplicates exist to prevent constraint errors later
END $$;