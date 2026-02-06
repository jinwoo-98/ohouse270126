-- Step 1: Drop the existing foreign key constraint if it exists.
ALTER TABLE public.shop_looks
DROP CONSTRAINT IF EXISTS shop_looks_category_id_fkey;

-- Step 2: Alter the column type from UUID to TEXT.
ALTER TABLE public.shop_looks
ALTER COLUMN category_id TYPE TEXT;

-- Step 3: Add a comment to clarify the new purpose of the column.
COMMENT ON COLUMN public.shop_looks.category_id IS 'Stores the slug of the category, not the UUID, to align with how products work.';