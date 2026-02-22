-- Add comprehensive RLS policies for authenticated users (admins) to manage content.
-- This migration fixes a systemic issue where tables had RLS enabled but lacked
-- policies for INSERT, UPDATE, and DELETE operations, causing silent failures in the admin panel.
-- The policy "Allow all for authenticated users" is a shorthand for allowing
-- SELECT, INSERT, UPDATE, and DELETE for any user who is logged in.

-- Drop existing policies to avoid conflicts if they were partially created
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.site_pages;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.attributes;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.category_attributes;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.product_variants;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.slides;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.product_attributes;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.usps;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.trending_keywords;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.lookbook_filters;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.shop_look_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.tracking_scripts;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.showrooms;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.homepage_sections;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.design_service_config;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.site_settings;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.theme_config;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.news;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.subscribers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.cooperation_requests;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.design_requests;

-- Create comprehensive policies for all admin-managed tables
CREATE POLICY "Allow all for authenticated users" ON public.site_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.category_attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.product_attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.usps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.shop_looks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.trending_keywords FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.lookbook_filters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.shop_look_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.tracking_scripts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.showrooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.homepage_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.design_service_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.theme_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.news FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.cooperation_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.design_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);