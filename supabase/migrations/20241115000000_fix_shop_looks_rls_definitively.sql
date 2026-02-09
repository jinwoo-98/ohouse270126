-- Migration: Definitive Rebuild of the Lookbook System
-- WARNING: This script will delete all existing data in shop_looks and shop_look_items.

-- Step 1: Drop existing tables to remove all conflicts, old policies, and triggers.
DROP TABLE IF EXISTS public.shop_look_items CASCADE;
DROP TABLE IF EXISTS public.shop_looks CASCADE;

-- Step 2: Recreate the 'shop_looks' table with the correct, final schema.
CREATE TABLE public.shop_looks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    category_id TEXT, -- Changed to TEXT to store slug
    image_url TEXT,
    gallery_urls TEXT[],
    is_active BOOLEAN DEFAULT true,
    homepage_image_url TEXT,
    style TEXT,
    material TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Re-enable Row Level Security and apply the definitive public read policy.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active lookbooks"
ON public.shop_looks
FOR SELECT
USING (is_active = true);

-- Step 4: Recreate the 'shop_look_items' table.
CREATE TABLE public.shop_look_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    look_id UUID NOT NULL REFERENCES public.shop_looks(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    x_position NUMERIC(5, 2) DEFAULT 50.00,
    y_position NUMERIC(5, 2) DEFAULT 50.00,
    target_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS and apply public read policy for look items.
ALTER TABLE public.shop_look_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read all look items"
ON public.shop_look_items FOR SELECT USING (true);

-- Step 6: Re-assert public read policies on related tables to be safe.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read all products" ON public.products;
CREATE POLICY "Public can read all products"
ON public.products FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read all categories" ON public.categories;
CREATE POLICY "Public can read all categories"
ON public.categories FOR SELECT USING (true);

-- Step 7: Recreate the slug generation trigger for 'shop_looks'.
-- The function 'slugify' and trigger function 'set_slug_from_title_for_looks' should already exist.
CREATE TRIGGER trg_set_slug_before_insert_update_looks
BEFORE INSERT OR UPDATE ON public.shop_looks
FOR EACH ROW
EXECUTE FUNCTION public.set_slug_from_title_for_looks();