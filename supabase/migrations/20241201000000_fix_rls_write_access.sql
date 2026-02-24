-- Fix RLS policies for core content tables to prevent unauthorized modification

-- 1. Products Table
DROP POLICY IF EXISTS "Auth all products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 2. Slides Table
DROP POLICY IF EXISTS "Admin manage slides" ON public.slides;
CREATE POLICY "Admin manage slides" ON public.slides
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3. Shop Looks Table
DROP POLICY IF EXISTS "Admin manage looks" ON public.shop_looks;
CREATE POLICY "Admin manage looks" ON public.shop_looks
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 4. Shop Look Items Table
DROP POLICY IF EXISTS "Admin manage look items" ON public.shop_look_items;
CREATE POLICY "Admin manage look items" ON public.shop_look_items
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 5. Trending Keywords Table
DROP POLICY IF EXISTS "Admin manage trending" ON public.trending_keywords;
CREATE POLICY "Admin manage trending" ON public.trending_keywords
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 6. USPs Table
DROP POLICY IF EXISTS "Admin manage usps" ON public.usps;
CREATE POLICY "Admin manage usps" ON public.usps
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 7. Site Settings Table
DROP POLICY IF EXISTS "Admin update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin insert settings" ON public.site_settings;
CREATE POLICY "Admin manage settings" ON public.site_settings
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());