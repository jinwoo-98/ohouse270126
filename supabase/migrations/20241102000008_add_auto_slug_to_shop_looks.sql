-- 1. Create or replace the slugify function to ensure it exists and is up-to-date.
-- This function converts text into a URL-friendly slug.
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
  -- trims hyphens from the start and end of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL IMMUTABLE;


-- 2. Create the trigger function that will set the slug for a shop_look.
CREATE OR REPLACE FUNCTION public.set_shop_looks_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- If the slug is empty or null, generate it from the title.
  -- Otherwise, clean up the provided slug to ensure it's URL-friendly.
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.title);
  ELSE
    NEW.slug := slugify(NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 3. Create the trigger on the shop_looks table.
-- This will automatically call the function before any insert or update.
DROP TRIGGER IF EXISTS on_shop_looks_insert_or_update ON public.shop_looks;

CREATE TRIGGER on_shop_looks_insert_or_update
BEFORE INSERT OR UPDATE ON public.shop_looks
FOR EACH ROW
EXECUTE FUNCTION public.set_shop_looks_slug();