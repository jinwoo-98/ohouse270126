-- Set all existing lookbooks to be active by default to fix display issue.
-- This ensures any lookbook that is currently false or null will be set to true.
UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NOT true;