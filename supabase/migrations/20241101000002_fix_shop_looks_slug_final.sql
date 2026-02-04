-- 1. Đảm bảo cột slug tồn tại
ALTER TABLE public.shop_looks ADD COLUMN IF NOT EXISTS slug text;

-- 2. Điền dữ liệu slug cho các dòng cũ chưa có (Tránh lỗi Unique khi tạo index)
-- Logic: Chuyển Tiếng Việt có dấu thành không dấu, thay khoảng trắng bằng gạch ngang, thêm 4 ký tự ID cuối để tránh trùng
UPDATE public.shop_looks
SET slug = 
  CASE 
    WHEN title IS NULL OR title = '' THEN 'lookbook-' || SUBSTRING(id::text FROM 1 FOR 8)
    ELSE
      LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRANSLATE(title, 'áàảãạâấầẩẫậăắằẳẵặđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ', 'aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAADEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY'),
            '[^a-z0-9\s-]', '', 'g'
          ),
          '\s+', '-', 'g'
        )
      ) || '-' || SUBSTRING(id::text FROM 1 FOR 4)
  END
WHERE slug IS NULL OR slug = '';

-- 3. Tạo ràng buộc duy nhất (Unique Constraint)
DROP INDEX IF EXISTS shop_looks_slug_idx;
CREATE UNIQUE INDEX IF NOT EXISTS shop_looks_slug_idx ON public.shop_looks (slug);

-- 4. QUAN TRỌNG NHẤT: Buộc PostgREST tải lại Schema Cache
-- Lệnh này sẽ báo cho API biết cấu trúc bảng đã thay đổi
NOTIFY pgrst, 'reload config';