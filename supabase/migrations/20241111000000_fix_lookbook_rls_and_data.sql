-- Giai đoạn 1: Khôi phục cấu trúc cột về đúng chuẩn UUID

-- Tạm thời gỡ bỏ khóa ngoại và chính sách RLS cũ để thay đổi cấu trúc
ALTER TABLE public.shop_looks DROP CONSTRAINT IF EXISTS shop_looks_category_id_fkey;
DROP POLICY IF EXISTS "Allow authenticated users to select lookbooks" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow authenticated users to insert lookbooks" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow authenticated users to update lookbooks" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow authenticated users to delete lookbooks" ON public.shop_looks;

-- Thêm cột tạm để lưu slug hiện tại
ALTER TABLE public.shop_looks ADD COLUMN temp_category_slug TEXT;
UPDATE public.shop_looks SET temp_category_slug = category_id;

-- Đặt lại cột category_id về NULL để chuẩn bị đổi kiểu
UPDATE public.shop_looks SET category_id = NULL;

-- Đổi kiểu dữ liệu của cột category_id trở lại UUID
ALTER TABLE public.shop_looks ALTER COLUMN category_id TYPE UUID USING category_id::uuid;

-- Giai đoạn 2: Cập nhật lại dữ liệu và thiết lập lại khóa ngoại

-- "Dịch" các slug từ cột tạm trở lại thành UUID cho cột category_id
UPDATE public.shop_looks l
SET category_id = c.id
FROM public.categories c
WHERE l.temp_category_slug = c.slug;

-- Xóa cột tạm sau khi đã hoàn tất
ALTER TABLE public.shop_looks DROP COLUMN temp_category_slug;

-- Thiết lập lại khóa ngoại để đảm bảo toàn vẹn dữ liệu
ALTER TABLE public.shop_looks
ADD CONSTRAINT shop_looks_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.categories(id)
ON DELETE SET NULL;

-- Giai đoạn 3: (An toàn) Gán một danh mục mặc định cho bất kỳ lookbook nào còn sót lại
DO $$
DECLARE
    default_category_id UUID;
BEGIN
    SELECT id INTO default_category_id
    FROM public.categories
    WHERE parent_id IS NULL AND menu_location = 'main'
    ORDER BY display_order, name
    LIMIT 1;

    IF default_category_id IS NOT NULL THEN
        UPDATE public.shop_looks
        SET category_id = default_category_id
        WHERE category_id IS NULL;
    END IF;
END $$;

-- Giai đoạn 4: Thiết lập lại các chính sách RLS một cách đúng đắn
CREATE POLICY "Allow public read access" ON public.shop_looks FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON public.shop_looks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON public.shop_looks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON public.shop_looks FOR DELETE TO authenticated USING (true);