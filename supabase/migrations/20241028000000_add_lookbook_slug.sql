-- Thêm cột slug vào bảng shop_looks
ALTER TABLE public.shop_looks
ADD COLUMN slug TEXT;

-- Tạo index cho cột slug
CREATE UNIQUE INDEX shop_looks_slug_idx ON public.shop_looks (slug);
ALTER TABLE public.shop_looks ADD CONSTRAINT shop_looks_slug_key UNIQUE USING INDEX shop_looks_slug_idx;

-- Tạo hàm slugify (nếu chưa có)
CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT lower(regexp_replace(trim(regexp_replace(value, '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'));
$$;

-- Tạo hàm để tự động sinh slug trước khi insert/update
CREATE OR REPLACE FUNCTION public.handle_look_slug()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.title IS NOT NULL AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug := public.slugify(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

-- Tạo trigger để gọi hàm handle_look_slug trước khi insert hoặc update
DROP TRIGGER IF EXISTS set_look_slug ON public.shop_looks;
CREATE TRIGGER set_look_slug
BEFORE INSERT OR UPDATE OF title, slug ON public.shop_looks
FOR EACH ROW EXECUTE FUNCTION public.handle_look_slug();