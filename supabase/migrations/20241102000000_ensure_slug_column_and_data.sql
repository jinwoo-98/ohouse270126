-- 1. Khởi tạo Extension xử lý tiếng Việt
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

-- 2. Tạo bảng shop_looks với ĐẦY ĐỦ các cột cần thiết ngay từ đầu
CREATE TABLE IF NOT EXISTS public.shop_looks (
    id uuid primary key default gen_random_uuid(),
    title text,
    slug text unique,
    image_url text,
    is_active boolean default true, -- Cột này sẽ giải quyết lỗi is_active does not exist
    created_at timestamptz default now()
);

-- 3. Đảm bảo các cột tồn tại (đề phòng bảng đã có nhưng thiếu cột)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shop_looks' AND column_name='title') THEN
        ALTER TABLE public.shop_looks ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shop_looks' AND column_name='slug') THEN
        ALTER TABLE public.shop_looks ADD COLUMN slug TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shop_looks' AND column_name='is_active') THEN
        ALTER TABLE public.shop_looks ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 4. Tạo hàm slugify
CREATE OR REPLACE FUNCTION public.slugify(v TEXT) RETURNS TEXT AS $$
  WITH "unaccented" AS (SELECT unaccent("v") AS "str"),
  "lowercase" AS (SELECT lower("str") AS "str" FROM "unaccented"),
  "removed_quotes" AS (SELECT regexp_replace("str", '[''"]+', '', 'gi') AS "str" FROM "lowercase"),
  "hyphenated" AS (SELECT regexp_replace(regexp_replace("str", 'đ', 'd', 'gi'), '[^a-z0-9\\-_]+', '-', 'gi') AS "str" FROM "removed_quotes"),
  "trimmed" AS (SELECT regexp_replace(regexp_replace("str", '^-+', ''), '-+$', '') AS "str" FROM "hyphenated")
  SELECT "str" FROM "trimmed";
$$ LANGUAGE SQL IMMUTABLE;

-- 5. Cập nhật dữ liệu mẫu (chỉ chạy nếu có title)
UPDATE public.shop_looks
SET slug = public.slugify(title), is_active = true
WHERE title IS NOT NULL;

-- 6. Thiết lập Trigger tự động
CREATE OR REPLACE FUNCTION public.set_slug_from_title_for_looks() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.title <> OLD.title) THEN
    NEW.slug := public.slugify(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_slug_before_insert_update ON public.shop_looks;
CREATE TRIGGER trg_set_slug_before_insert_update BEFORE INSERT OR UPDATE ON public.shop_looks FOR EACH ROW EXECUTE FUNCTION public.set_slug_from_title_for_looks();