-- =================================================================
-- STEP 1: DATA CORRECTION & HEALING
-- This step ensures all existing lookbooks are in a valid state.
-- =================================================================

-- Forcefully activate all existing lookbooks. This is the "Disabled Switch" fix.
UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NOT true;

-- Regenerate slugs for any lookbooks that are still missing one. This is the "Corrupted Data" fix (part 1).
-- This relies on the slugify function being present. The previous migration should have created it.
-- To be safe, I will include the function creation again.
CREATE OR REPLACE FUNCTION public.slugify(v text)
RETURNS text LANGUAGE sql IMMUTABLE AS $function$
  WITH "unaccented" AS (SELECT unaccent("v") AS "str"),
  "lowercase" AS (SELECT lower("str") AS "str" FROM "unaccented"),
  "removed_quotes" AS (SELECT regexp_replace("str", '[''"]+', '', 'gi') AS "str" FROM "lowercase"),
  "hyphenated" AS (SELECT regexp_replace(regexp_replace("str", 'đ', 'd', 'gi'), '[^a-z0-9\\-_]+', '-', 'gi') AS "str" FROM "removed_quotes"),
  "trimmed" AS (SELECT regexp_replace(regexp_replace("str", '^-+', ''), '-+$', '') AS "str" FROM "hyphenated")
  SELECT "str" FROM "trimmed";
$function$;

UPDATE public.shop_looks
SET slug = public.slugify(title)
WHERE slug IS NULL OR slug = '';

-- Rescue any "orphan" lookbooks that lost their category link. This is the "Corrupted Data" fix (part 2).
DO $$
DECLARE
    default_category_id UUID;
BEGIN
    -- Find a default parent category to assign orphans to.
    SELECT id INTO default_category_id
    FROM public.categories
    WHERE parent_id IS NULL AND menu_location = 'main'
    ORDER BY display_order, name
    LIMIT 1;

    -- If a default category is found, update all orphan lookbooks.
    IF default_category_id IS NOT NULL THEN
        UPDATE public.shop_looks
        SET category_id = default_category_id
        WHERE category_id IS NULL;
    END IF;
END $$;


-- =================================================================
-- STEP 2: ROW LEVEL SECURITY (RLS) SETUP
-- This is the "Locked Door" fix, the most critical part.
-- =================================================================

-- Enable Row Level Security on the table.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Drop any existing public read policies to avoid conflicts.
DROP POLICY IF EXISTS "Public read access for active looks" ON public.shop_looks;

-- Create a new policy that allows ANYONE (public) to SELECT (read)
-- only the lookbooks where the 'is_active' switch is ON.
CREATE POLICY "Public read access for active looks"
ON public.shop_looks
FOR SELECT
USING (is_active = true);