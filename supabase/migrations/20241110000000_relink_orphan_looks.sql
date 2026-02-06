-- This migration attempts to recover from a data loss scenario where
-- shop_looks.category_id was incorrectly handled and data was lost.
-- It assigns all un-categorized lookbooks to the first available main category.

DO $$
DECLARE
    default_category_id UUID;
BEGIN
    -- Step 1: Find the ID of the first main category to use as a default.
    -- We'll pick the one with the lowest display_order.
    SELECT id INTO default_category_id
    FROM public.categories
    WHERE parent_id IS NULL AND menu_location = 'main'
    ORDER BY display_order, name
    LIMIT 1;

    -- Step 2: If a default category was found, update all lookbooks that
    -- currently have no category assigned.
    IF default_category_id IS NOT NULL THEN
        UPDATE public.shop_looks
        SET category_id = default_category_id
        WHERE category_id IS NULL;
    END IF;
END $$;