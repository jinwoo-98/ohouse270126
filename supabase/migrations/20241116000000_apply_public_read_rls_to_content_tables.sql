-- This migration ensures all tables related to displaying "Shop The Look"
-- have the correct Row Level Security (RLS) policies for public access.

-- Table: shop_looks (The main lookbook entry)
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for shop_looks" ON public.shop_looks;
CREATE POLICY "Public read access for shop_looks" ON public.shop_looks
FOR SELECT USING (true);

-- Table: shop_look_items (The items/hotspots within a lookbook)
-- This was the critical missing piece in previous attempts.
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for shop_look_items" ON public.shop_look_items;
CREATE POLICY "Public read access for shop_look_items" ON public.shop_look_items
FOR SELECT USING (true);

-- Table: products (The products linked by shop_look_items)
-- Must also be readable to show product info in hotspots.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products
FOR SELECT USING (true);

-- Table: categories (Used to filter and categorize lookbooks)
-- Must be readable to group looks by category.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories
FOR SELECT USING (true);