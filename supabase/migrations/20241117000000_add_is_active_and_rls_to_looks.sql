-- Migration: Add is_active column and fix RLS for shop_looks and related tables

-- Step 1: Add the missing 'is_active' column to the 'shop_looks' table.
-- We add it only if it doesn't exist to make the script safe to re-run.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'shop_looks'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.shop_looks
        ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Step 2: Update all existing lookbooks to be active.
-- This ensures that all current content will be visible immediately.
UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NULL;

-- Step 3: Definitively enable RLS and apply the correct public read policies.
-- This will override any previous incorrect settings.

-- For shop_looks table
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active lookbooks" ON public.shop_looks;
CREATE POLICY "Public can read active lookbooks"
ON public.shop_looks
FOR SELECT
USING (is_active = true);

-- For shop_look_items table (safeguard)
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read lookbook items" ON public.shop_look_items;
CREATE POLICY "Public can read lookbook items"
ON public.shop_look_items
FOR SELECT
USING (true);

-- For products table (safeguard)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products"
ON public.products
FOR SELECT
USING (true);