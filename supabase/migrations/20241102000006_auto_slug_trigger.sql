-- 1. Ensure slug column exists (Idempotent)
ALTER TABLE public.shop_looks ADD COLUMN IF NOT EXISTS slug text;

-- 2. Create a function to generate slug from title if it's missing
CREATE OR REPLACE FUNCTION public.generate_look_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is null or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate slug: lowercase, replace non-alphanumeric with hyphen, add random suffix for uniqueness
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger to run this function before Insert/Update
DROP TRIGGER IF EXISTS tr_auto_slug_shop_looks ON public.shop_looks;
CREATE TRIGGER tr_auto_slug_shop_looks
BEFORE INSERT OR UPDATE ON public.shop_looks
FOR EACH ROW
EXECUTE FUNCTION public.generate_look_slug();

-- 4. Backfill existing records that might miss a slug
UPDATE public.shop_looks 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 4)
WHERE slug IS NULL OR slug = '';

-- 5. Force schema reload again
NOTIFY pgrst, 'reload schema';