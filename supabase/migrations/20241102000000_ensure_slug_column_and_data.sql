-- This migration ensures the slug column exists and backfills data for existing looks.
-- It also creates the slugify function and trigger to automate slug generation going forward.

-- 1. Create the unaccent extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Create the slugify function
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

-- 3. Add the slug column if it doesn't exist (just in case)
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 4. Backfill existing slugs
UPDATE public.shop_looks
SET slug = public.slugify(title)
WHERE slug IS NULL OR slug = '';

-- 5. Create the trigger function to set slug from title
CREATE OR REPLACE FUNCTION public.set_slug_from_title_for_looks()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a new slug if the title changes, or if the slug is null/empty on insert
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.title <> OLD.title) THEN
    NEW.slug := public.slugify(NEW.title);
    -- Check for uniqueness and append a number if needed
    DECLARE
      slug_exists BOOLEAN;
      counter INT := 1;
      original_slug TEXT := NEW.slug;
    BEGIN
      LOOP
        SELECT EXISTS(SELECT 1 FROM public.shop_looks WHERE slug = NEW.slug AND id <> NEW.id) INTO slug_exists;
        IF NOT slug_exists THEN
          EXIT;
        END IF;
        NEW.slug := original_slug || '-' || counter;
        counter := counter + 1;
      END LOOP;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Drop and recreate the trigger to ensure it's the latest version
DROP TRIGGER IF EXISTS trg_set_slug_before_insert_update ON public.shop_looks;

CREATE TRIGGER trg_set_slug_before_insert_update
BEFORE INSERT OR UPDATE ON public.shop_looks
FOR EACH ROW
EXECUTE FUNCTION public.set_slug_from_title_for_looks();