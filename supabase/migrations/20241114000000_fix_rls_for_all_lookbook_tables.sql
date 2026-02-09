-- === COMPREHENSIVE RLS FIX FOR LOOKBOOK SYSTEM ===
-- This migration ensures public read access for the entire data chain required to display lookbooks.

-- 1. Configure RLS for `shop_looks` table (Lookbook main info)
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON public.shop_looks;
DROP POLICY IF EXISTS "Admin full access" ON public.shop_looks;
CREATE POLICY "Public read access" ON public.shop_looks FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.shop_looks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Configure RLS for `shop_look_items` table (Lookbook product tags)
-- THIS WAS A MISSING KEY.
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON public.shop_look_items;
DROP POLICY IF EXISTS "Admin full access" ON public.shop_look_items;
CREATE POLICY "Public read access" ON public.shop_look_items FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.shop_look_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Configure RLS for `products` table (Product details)
-- THIS WAS THE SECOND MISSING KEY.
-- This policy is safe and will not affect other parts of the site.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON public.products;
DROP POLICY IF EXISTS "Admin full access" ON public.products;
CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);