-- Check if the slug column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'shop_looks' AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.shop_looks ADD COLUMN slug TEXT;
    END IF;
END
$$;

-- Add a unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'shop_looks_slug_key'
    ) THEN
        ALTER TABLE public.shop_looks ADD CONSTRAINT shop_looks_slug_key UNIQUE (slug);
    END IF;
END
$$;