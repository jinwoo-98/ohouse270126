-- Migration: Rebuild Lookbook System for Public Visibility

-- Step 1: Add 'is_active' column if it doesn't exist.
-- Default to TRUE to make all existing looks visible immediately.
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Ensure all existing looks are marked as active.
UPDATE public.shop_looks SET is_active = true WHERE is_active IS NULL;

-- Step 3: Enable Row Level Security on the table. This is crucial.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop any old, potentially conflicting policies to ensure a clean state.
DROP POLICY IF EXISTS "Public can read active lookbooks" ON public.shop_looks;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shop_looks;

-- Step 5: Create the definitive policy for public read access.
-- Only looks with is_active = true will be visible to everyone.
CREATE POLICY "Public can read active lookbooks"
ON public.shop_looks
FOR SELECT
USING (is_active = true);

-- Step 6: Ensure related tables also have public read access.
-- This prevents issues where the look is visible but its items/products are not.

-- For shop_look_items
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read all items" ON public.shop_look_items;
CREATE POLICY "Public can read all items"
ON public.shop_look_items FOR SELECT USING (true);

-- For products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read all products" ON public.products;
CREATE POLICY "Public can read all products"
ON public.products FOR SELECT USING (true);