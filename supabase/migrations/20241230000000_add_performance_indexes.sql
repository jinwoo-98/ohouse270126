-- This migration adds performance indexes to frequently queried columns.

-- Products table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_featured ON public.products (is_featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_sale ON public.products (is_sale);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_new ON public.products (is_new);

-- Shop Looks table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_looks_category_id ON public.shop_looks (category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_looks_slug ON public.shop_looks (slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_looks_is_active ON public.shop_looks (is_active);

-- Reviews table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);

-- Orders table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Categories table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON public.categories (parent_id);

-- Profiles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Product Attributes table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_attributes_product_id ON public.product_attributes (product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_attributes_attribute_id ON public.product_attributes (attribute_id);

-- Shop Look Items table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_look_items_look_id ON public.shop_look_items (look_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_look_items_product_id ON public.shop_look_items (product_id);