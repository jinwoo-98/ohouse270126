-- === DEFINITIVE FIX FOR LOOKBOOK VISIBILITY ===
-- This migration performs three critical actions:
-- 1. Adds the missing `is_active` column to the `shop_looks` table.
-- 2. Activates all existing lookbooks by setting `is_active` to `true`.
-- 3. Applies the correct, complete set of RLS policies for public read access.

-- Step 1: Add the `is_active` column, defaulting to false initially.
ALTER TABLE public.shop_looks
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

-- Step 2: Activate all lookbooks that have already been created.
UPDATE public.shop_looks
SET is_active = true;

-- Step 3: Configure RLS for the entire lookbook data chain.

-- RLS for `shop_looks`
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for active looks" ON public.shop_looks;
CREATE POLICY "Public read access for active looks" ON public.shop_looks
FOR SELECT USING (is_active = true); -- CRITICAL: Only show active lookbooks to the public.

-- RLS for `shop_look_items`
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for look items" ON public.shop_look_items;
CREATE POLICY "Public read access for look items" ON public.shop_look_items
FOR SELECT USING (true);

-- RLS for `products`
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products
FOR SELECT USING (true);

-- Grant permissions to the anonymous role to read the data.
GRANT SELECT ON TABLE public.shop_looks TO anon;
GRANT SELECT ON TABLE public.shop_look_items TO anon;
GRANT SELECT ON TABLE public.products TO anon;