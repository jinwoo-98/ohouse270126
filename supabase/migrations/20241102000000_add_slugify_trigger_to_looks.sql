-- 1. Create the unaccent extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Create the slugify function to handle Vietnamese characters
CREATE OR REPLACE FUNCTION public.slugify(
  v TEXT
) RETURNS TEXT AS $$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("v") AS "str"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("str") AS "str"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("str", '[''"]+', '', 'gi') AS "str"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen, or underscore with a hyphen
  "hyphenated" AS (
    SELECT regexp_replace(regexp_replace("str", 'đ', 'd', 'gi'), '[^a-z0-9\\-_]+', '-', 'gi') AS "str"
    FROM "removed_quotes"
  ),
  -- trims hyphens from the start and end of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("str", '^-+', ''), '-+$', '') AS "str"
    FROM "hyphenated"
  )
  SELECT "str" FROM "trimmed";
$$ LANGUAGE SQL IMMUTABLE;


-- 3. Create the trigger function to set slug from title
CREATE OR REPLACE FUNCTION public.set_slug_from_title_for_looks()
RETURNS TRIGGER AS $$
BEGIN
  -- if the slug is being set to an empty string, is null, or is being updated, generate it from the title
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND NEW.title <> OLD.title) THEN
    NEW.slug := public.slugify(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing trigger if it exists, then create the new trigger
DROP TRIGGER IF EXISTS trg_set_slug_before_insert_update ON public.shop_looks;

CREATE TRIGGER trg_set_slug_before_insert_update
BEFORE INSERT OR UPDATE ON public.shop_looks
FOR EACH ROW
EXECUTE FUNCTION public.set_slug_from_title_for_looks();