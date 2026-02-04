-- This migration re-confirms the slug column and its constraints,
-- which helps in forcing a schema cache reload on the Supabase API layer.

-- 1. Add slug column if it doesn't exist
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create a function to generate slugs (re-affirming its existence)
CREATE OR REPLACE FUNCTION public.slugify(
  "value" TEXT
)
RETURNS TEXT AS $$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen, or underscore with a hyphen
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens from start and end of string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL IMMUTABLE;

-- 3. Populate slug for any existing rows where slug is still NULL or empty.
-- This is a safety net to ensure data integrity.
UPDATE public.shop_looks
SET slug = slugify(title) || '-' || substr(md5(random()::text), 0, 5)
WHERE slug IS NULL OR slug = '';

-- 4. Add unique constraint if it doesn't exist. This is crucial.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shop_looks_slug_key' AND conrelid = 'public.shop_looks'::regclass
    ) THEN
        ALTER TABLE public.shop_looks ADD CONSTRAINT shop_looks_slug_key UNIQUE (slug);
    END IF;
END;
$$;