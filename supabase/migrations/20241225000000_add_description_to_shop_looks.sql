-- Add description column to shop_looks table
ALTER TABLE public.shop_looks ADD COLUMN IF NOT EXISTS description TEXT;

-- Update RLS policies to ensure the new column is accessible
-- (Existing policies usually cover all columns, but this ensures schema cache is refreshed)