-- Step 1: Drop the problematic category_id column if it exists as text
DO $$
BEGIN
   IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'shop_looks'
      AND column_name = 'category_id'
      AND data_type = 'text'
   ) THEN
      ALTER TABLE public.shop_looks DROP COLUMN category_id;
   END IF;
END $$;

-- Step 2: Add the category_id column correctly as a UUID with a foreign key
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'shop_looks'
      AND column_name = 'category_id'
   ) THEN
      ALTER TABLE public.shop_looks
      ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
   END IF;
END $$;

-- Step 3: Enable Row Level Security on the table if not already enabled
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Step 4: Add a public read policy for SELECT operations
-- This allows anyone to view the lookbooks, which is typical for an e-commerce site.
-- Drop the policy first to avoid errors if it already exists.
DROP POLICY IF EXISTS "Public read access for shop_looks" ON public.shop_looks;
CREATE POLICY "Public read access for shop_looks" ON public.shop_looks
FOR SELECT USING (true);