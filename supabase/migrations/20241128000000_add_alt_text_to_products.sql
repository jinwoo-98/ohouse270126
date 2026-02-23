-- Add a new column to store SEO-friendly alt text for the main product image.
ALTER TABLE public.products
ADD COLUMN image_alt_text TEXT;