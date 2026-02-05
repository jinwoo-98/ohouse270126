-- This migration forces a schema cache refresh for the shop_looks table.
-- It adds a non-functional comment to trigger the cache invalidation.
COMMENT ON TABLE public.shop_looks IS 'Force schema refresh to recognize the slug column.';