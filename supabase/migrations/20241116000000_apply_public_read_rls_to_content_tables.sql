-- This migration ensures that all tables related to displaying lookbooks
-- have the correct Row Level Security (RLS) policies for public access.
-- It is designed to run last to override any previous conflicting migrations.

-- 1. Enable RLS and set public read policy for 'shop_looks'
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active lookbooks" ON public.shop_looks;

CREATE POLICY "Public can read active lookbooks"
ON public.shop_looks
FOR SELECT
USING (is_active = true);


-- 2. Enable RLS and set public read policy for 'shop_look_items'
-- This table links lookbooks to products (hotspots).
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read lookbook items" ON public.shop_look_items;

CREATE POLICY "Public can read lookbook items"
ON public.shop_look_items
FOR SELECT
USING (true);


-- 3. Enable RLS and set public read policy for 'products'
-- This is the final link in the chain, allowing product details to be fetched.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;

CREATE POLICY "Public can read products"
ON public.products
FOR SELECT
USING (true);