-- This migration is a "sledgehammer" approach to force a schema cache reload.
-- It performs a series of safe but disruptive alterations to the shop_looks table.

-- Step 1: Add a temporary column to signal a major schema change.
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS _cache_buster_col TEXT;

-- Step 2: Update all rows to ensure the change is propagated.
UPDATE public.shop_looks
SET _cache_buster_col = md5(random()::text);

-- Step 3: Drop the temporary column. This completes the disruptive change cycle.
ALTER TABLE public.shop_looks
DROP COLUMN IF EXISTS _cache_buster_col;

-- Step 4: Re-affirm the existence and integrity of the 'slug' column as a final safety measure.
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Re-run the slugify function creation just in case.
CREATE OR REPLACE FUNCTION public.slugify(
  "value" TEXT
)
RETURNS TEXT AS $$
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL IMMUTABLE;

-- Re-populate any potentially missing slugs.
UPDATE public.shop_looks
SET slug = slugify(title) || '-' || substr(id::text, 1, 4)
WHERE slug IS NULL OR slug = '' OR slug ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Re-ensure the unique constraint exists.
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

-- Notify PostgREST to reload the schema. This is the most direct command.
NOTIFY pgrst, 'reload schema';