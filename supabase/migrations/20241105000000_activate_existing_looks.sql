-- Update all existing records in the shop_looks table to be active.
-- This ensures that any lookbooks created before this change will now be visible on the website.
-- The is_active column acts as a toggle; setting it to 'true' makes the lookbook public.
UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NOT true;

-- Also, ensure a default value for new entries if it's not already set.
-- This makes new lookbooks active by default, improving user experience.
ALTER TABLE public.shop_looks
ALTER COLUMN is_active SET DEFAULT true;