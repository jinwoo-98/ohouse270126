-- Thêm cột square_image_url vào bảng shop_looks
ALTER TABLE public.shop_looks ADD COLUMN IF NOT EXISTS square_image_url TEXT;