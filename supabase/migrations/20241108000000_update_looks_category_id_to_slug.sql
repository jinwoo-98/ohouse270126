-- This migration updates the `category_id` column in the `shop_looks` table.
-- It converts old UUID-based category IDs into their corresponding slug values
-- to ensure data consistency with the new application logic.

-- Create a temporary helper function to safely check if a string is a valid UUID.
CREATE OR REPLACE FUNCTION is_uuid(text) RETURNS boolean AS $$
BEGIN
    -- This regex checks for the standard UUID format.
    RETURN $1 ~* '^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Perform the update.
-- Join `shop_looks` with `categories` and update the `category_id` to the category's `slug`
-- ONLY for rows where the current `category_id` is a valid UUID.
UPDATE public.shop_looks sl
SET category_id = c.slug
FROM public.categories c
WHERE 
  is_uuid(sl.category_id) AND sl.category_id::uuid = c.id;

-- Clean up by dropping the temporary helper function.
DROP FUNCTION is_uuid(text);