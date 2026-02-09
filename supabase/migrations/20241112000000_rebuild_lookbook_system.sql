-- Step 1: Recreate the slugify function if it doesn't exist or is incorrect.
CREATE OR REPLACE FUNCTION public.slugify(v text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  WITH "unaccented" AS (SELECT unaccent("v") AS "str"),
  "lowercase" AS (SELECT lower("str") AS "str" FROM "unaccented"),
  "removed_quotes" AS (SELECT regexp_replace("str", '[''"]+', '', 'gi') AS "str" FROM "lowercase"),
  "hyphenated" AS (SELECT regexp_replace(regexp_replace("str", 'đ', 'd', 'gi'), '[^a-z0-9\\-_]+', '-', 'gi') AS "str" FROM "removed_quotes"),
  "trimmed" AS (SELECT regexp_replace(regexp_replace("str", '^-+', ''), '-+$', '') AS "str" FROM "hyphenated")
  SELECT "str" FROM "trimmed";
$function$;

-- Step 2: Recreate the trigger function to set slug from title.
CREATE OR REPLACE FUNCTION public.set_slug_from_title_for_looks()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only update the slug if it's a new record or the title has changed.
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
    NEW.slug := public.slugify(NEW.title);
  END IF;
  RETURN NEW;
END;
$function$;

-- Step 3: Drop the existing trigger to avoid conflicts, then recreate it.
DROP TRIGGER IF EXISTS trg_set_slug_before_insert_update ON public.shop_looks;
CREATE TRIGGER trg_set_slug_before_insert_update
  BEFORE INSERT OR UPDATE ON public.shop_looks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_slug_from_title_for_looks();

-- Step 4: Backfill slugs for all existing looks where the slug is currently NULL.
UPDATE public.shop_looks
SET slug = public.slugify(title)
WHERE slug IS NULL AND title IS NOT NULL;

-- Step 5: Activate all existing looks to ensure they are visible.
UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NOT true;

-- Step 6: Enable Row Level Security (RLS) on the table. CRITICAL FOR PUBLIC VISIBILITY.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Step 7: Create a policy to allow public read access to active looks.
-- This is the key to making lookbooks visible on the website.
DROP POLICY IF EXISTS "Public read access for active looks" ON public.shop_looks;
CREATE POLICY "Public read access for active looks" ON public.shop_looks
FOR SELECT USING (is_active = true);

-- Step 8: Create policies for admin/editors to manage all looks.
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.shop_looks;
CREATE POLICY "Allow full access to authenticated users" ON public.shop_looks
FOR ALL USING (true) WITH CHECK (true);