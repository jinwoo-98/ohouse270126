-- === DEFINITIVE FIX FOR LOOKBOOK CATEGORY LOGIC ===
-- This migration corrects the core data type mismatch for lookbook categories.
-- It changes the `category_id` column from UUID to TEXT to store slugs,
-- and migrates existing data to the new format.

-- Step 1: Add a new temporary column to store the category slug.
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS category_slug TEXT;

-- Step 2: Update the new column with the correct slug by joining on the old UUID-based category_id.
-- This finds the matching slug from the `categories` table for each lookbook.
UPDATE public.shop_looks sl
SET category_slug = c.slug
FROM public.categories c
WHERE c.id = sl.category_id;

-- Step 3: Drop the old, incorrect UUID-based category_id column.
-- We must first drop any foreign key constraints that might exist.
ALTER TABLE public.shop_looks DROP CONSTRAINT IF EXISTS shop_looks_category_id_fkey;
ALTER TABLE public.shop_looks DROP COLUMN IF EXISTS category_id;

-- Step 4: Rename the new column to become the primary category identifier.
ALTER TABLE public.shop_looks
RENAME COLUMN category_slug TO category_id;

-- Step 5: Re-apply the RLS policy to ensure security is correctly configured.
-- This policy ensures that only lookbooks marked as `is_active` are visible to the public.
-- The frontend query will now correctly filter by the slug, and this RLS provides the final security check.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for active looks" ON public.shop_looks;
CREATE POLICY "Public read access for active looks" ON public.shop_looks
FOR SELECT USING (is_active = true);

-- Re-grant permissions to be safe.
GRANT SELECT ON TABLE public.shop_looks TO anon;