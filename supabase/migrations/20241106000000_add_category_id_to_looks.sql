-- Add category_id column to shop_looks table to store the category's UUID
ALTER TABLE public.shop_looks
ADD COLUMN category_id UUID;

-- Add foreign key constraint to link to the categories table
-- ON DELETE SET NULL means if a category is deleted, the lookbook's category will become empty but the lookbook itself won't be deleted.
ALTER TABLE public.shop_looks
ADD CONSTRAINT shop_looks_category_id_fkey
FOREIGN KEY (category_id) REFERENCES public.categories(id)
ON DELETE SET NULL;

-- Create an index on the new column for better query performance
CREATE INDEX IF NOT EXISTS idx_shop_looks_category_id ON public.shop_looks(category_id);