-- 1. Đảm bảo cột slug tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_looks' AND column_name = 'slug') THEN
        ALTER TABLE shop_looks ADD COLUMN slug text;
    END IF;
END $$;

-- 2. Tự động điền slug cho các bản ghi cũ chưa có (để tránh lỗi null)
-- Sử dụng hàm đơn giản để tạo slug từ title nếu slug đang null
UPDATE shop_looks 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL OR slug = '';

-- 3. Tạo ràng buộc Unique (nếu chưa có) để đảm bảo không trùng lặp URL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'shop_looks' AND indexname = 'shop_looks_slug_idx') THEN
        CREATE UNIQUE INDEX shop_looks_slug_idx ON shop_looks (slug);
    END IF;
END $$;

-- 4. QUAN TRỌNG: Bắt buộc PostgREST tải lại cấu trúc bảng (Fix lỗi schema cache)
NOTIFY pgrst, 'reload config';