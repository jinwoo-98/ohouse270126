-- This migration fixes critical security flaws where core tables allowed public write access.
-- It ensures that only authenticated users with 'admin' or 'editor' roles can modify data.

-- 1. Fix products table
DROP POLICY IF EXISTS "Auth all products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 2. Fix slides table
DROP POLICY IF EXISTS "Admin manage slides" ON public.slides;
CREATE POLICY "Admin manage slides" ON public.slides
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 3. Fix usps table
DROP POLICY IF EXISTS "Admin manage usps" ON public.usps;
CREATE POLICY "Admin manage usps" ON public.usps
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 4. Fix trending_keywords table
DROP POLICY IF EXISTS "Admin manage trending" ON public.trending_keywords;
CREATE POLICY "Admin manage trending" ON public.trending_keywords
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 5. Fix shop_looks table
DROP POLICY IF EXISTS "Admin manage looks" ON public.shop_looks;
CREATE POLICY "Admin manage looks" ON public.shop_looks
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 6. Fix shop_look_items table
DROP POLICY IF EXISTS "Admin manage look items" ON public.shop_look_items;
CREATE POLICY "Admin manage look items" ON public.shop_look_items
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 7. Standardize categories table (ensuring editor role is included)
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories
FOR ALL TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());