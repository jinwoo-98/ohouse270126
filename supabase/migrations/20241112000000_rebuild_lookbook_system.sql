-- Giai đoạn 1: Cài đặt lại các hàm và trigger cần thiết cho việc tạo slug tự động

-- Xóa trigger và hàm cũ nếu tồn tại để đảm bảo cài đặt mới hoàn toàn
DROP TRIGGER IF EXISTS trg_set_slug_before_insert_update ON public.shop_looks;
DROP FUNCTION IF EXISTS public.set_slug_from_title_for_looks();
DROP FUNCTION IF EXISTS public.slugify(text);

-- Tái tạo hàm slugify (công thức chuyển đổi tiêu đề thành slug)
CREATE OR REPLACE FUNCTION public.slugify(v text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  WITH "unaccented" AS (SELECT unaccent("v") AS "str"),
  "lowercase" AS (SELECT lower("str") AS "str" FROM "unaccented"),
  "removed_quotes" AS (SELECT regexp_replace("str", '[''"]+', '', 'gi') AS "str" FROM "lowercase"),
  "hyphenated" AS (SELECT regexp_replace(regexp_replace("str", 'đ', 'd', 'gi'), '[^a-z0-9\\-_]+', '-', 'gi') AS "str" FROM "removed_quotes"),
  "trimmed" AS (SELECT regexp_replace(regexp_replace("str", '^-+', ''), '-+$', '') AS "str" FROM "hyphenated")
  SELECT "str" FROM "trimmed";
$function$;

-- Tái tạo hàm trigger (cỗ máy tự động chạy khi tạo/sửa lookbook)
CREATE OR REPLACE FUNCTION public.set_slug_from_title_for_looks()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Chỉ tạo slug mới nếu là INSERT hoặc title đã thay đổi
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.title <> OLD.title) THEN
    NEW.slug := public.slugify(NEW.title);
  END IF;
  RETURN NEW;
END;
$function$;

-- Gắn trigger vào bảng shop_looks
CREATE TRIGGER trg_set_slug_before_insert_update
BEFORE INSERT OR UPDATE ON public.shop_looks
FOR EACH ROW
EXECUTE FUNCTION set_slug_from_title_for_looks();


-- Giai đoạn 2: "Chữa lành" dữ liệu hiện có trong bảng shop_looks

-- Cập nhật lại slug cho tất cả các lookbook đang bị thiếu (slug IS NULL)
UPDATE public.shop_looks
SET slug = public.slugify(title)
WHERE slug IS NULL AND title IS NOT NULL;

-- "Cứu" các lookbook bị mất liên kết danh mục (category_id IS NULL)
DO $$
DECLARE
    default_category_id UUID;
BEGIN
    -- Tìm một danh mục gốc mặc định (ưu tiên danh mục có slug 'noi-that' hoặc danh mục đầu tiên)
    SELECT id INTO default_category_id
    FROM public.categories
    WHERE slug = 'noi-that' AND parent_id IS NULL
    LIMIT 1;

    IF default_category_id IS NULL THEN
        SELECT id INTO default_category_id
        FROM public.categories
        WHERE parent_id IS NULL AND menu_location = 'main'
        ORDER BY display_order, name
        LIMIT 1;
    END IF;

    -- Nếu tìm thấy danh mục mặc định, cập nhật tất cả các lookbook đang "mồ côi"
    IF default_category_id IS NOT NULL THEN
        UPDATE public.shop_looks
        SET category_id = default_category_id
        WHERE category_id IS NULL;
    END IF;
END $$;