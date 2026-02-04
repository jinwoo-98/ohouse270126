-- Thêm cột slug nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_looks' AND column_name = 'slug') THEN
        ALTER TABLE shop_looks ADD COLUMN slug text;
    END IF;
END $$;

-- Tạo index unique cho slug để đảm bảo tính duy nhất
CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_looks_slug ON shop_looks(slug);