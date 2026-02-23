-- Add image_alt_text column to products table
ALTER TABLE public.products
ADD COLUMN image_alt_text TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN public.products.image_alt_text IS 'Alt text for the main product image, for SEO purposes.';