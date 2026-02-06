-- Giai đoạn 1: Kích hoạt và thiết lập chính sách bảo mật (RLS)
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Xóa các chính sách cũ để tránh xung đột
DROP POLICY IF EXISTS "Allow public read access" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.shop_looks;

-- Tạo chính sách cho phép mọi người đọc (quan trọng để hiển thị trên web)
CREATE POLICY "Allow public read access" ON public.shop_looks
FOR SELECT USING (true);

-- Tạo chính sách cho phép người dùng đã xác thực (admin/editor) quản lý
CREATE POLICY "Allow insert for authenticated users" ON public.shop_looks
FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON public.shop_looks
FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON public.shop_looks
FOR DELETE TO authenticated USING (true);

-- Giai đoạn 2: "Cứu" các lookbook bị mất liên kết (category_id IS NULL)
DO $$
DECLARE
    default_category_id UUID;
BEGIN
    -- Tìm một danh mục gốc mặc định (ví dụ: danh mục đầu tiên trong menu chính)
    SELECT id INTO default_category_id
    FROM public.categories
    WHERE parent_id IS NULL AND menu_location = 'main'
    ORDER BY display_order, name
    LIMIT 1;

    -- Nếu tìm thấy danh mục mặc định, cập nhật tất cả các lookbook đang "mồ côi"
    IF default_category_id IS NOT NULL THEN
        UPDATE public.shop_looks
        SET category_id = default_category_id
        WHERE category_id IS NULL;
    END IF;
END $$;