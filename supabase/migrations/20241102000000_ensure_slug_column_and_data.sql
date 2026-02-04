-- Thêm cột slug nếu nó chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_looks' AND column_name = 'slug') THEN
        ALTER TABLE public.shop_looks ADD COLUMN slug text;
        -- Tạo index cho slug để tăng tốc độ tìm kiếm
        CREATE UNIQUE INDEX shop_looks_slug_idx ON public.shop_looks (slug);
    END IF;
END $$;

-- Cập nhật các bản ghi cũ chưa có slug (nếu cần)
-- Lưu ý: Hàm này cần được chạy thủ công hoặc thông qua migration tool
-- UPDATE public.shop_looks
-- SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9\s]+', '', 'g'))
-- WHERE slug IS NULL AND title IS NOT NULL;