-- This migration forces a reload of the schema cache for the shop_looks table.
-- By adding and then immediately removing a comment, we trigger a schema change notification
-- for PostgREST, resolving the "column not found in cache" issue.
COMMENT ON COLUMN public.shop_looks.slug IS 'Forcing schema cache reload';
COMMENT ON COLUMN public.shop_looks.slug IS NULL;