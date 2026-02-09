-- This migration activates all existing lookbooks in the shop_looks table
-- so they can be displayed on the Inspiration page.
-- New lookbooks will be managed via the admin UI.

UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NOT true;