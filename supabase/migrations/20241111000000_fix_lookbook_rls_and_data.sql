-- Giai đoạn 1: Sửa lỗi bảo mật (RLS) bằng cách thêm các chính sách cần thiết.
-- Điều này sẽ khắc phục lỗi "tạo mới rồi biến mất" và cho phép các thao tác cập nhật.

-- Chính sách cho phép người dùng đã xác thực (admin/editor) xem tất cả lookbook.
CREATE POLICY "Allow authenticated users to select lookbooks"
ON public.shop_looks
FOR SELECT
TO authenticated
USING (true);

-- Chính sách cho phép người dùng đã xác thực thêm mới lookbook.
-- ĐÂY LÀ QUY TẮC QUAN TRỌNG NHẤT ĐÃ BỊ BỎ SÓT.
CREATE POLICY "Allow authenticated users to insert lookbooks"
ON public.shop_looks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Chính sách cho phép người dùng đã xác thực cập nhật lookbook.
-- Cần thiết để chạy script cứu dữ liệu bên dưới.
CREATE POLICY "Allow authenticated users to update lookbooks"
ON public.shop_looks
FOR UPDATE
TO authenticated
USING (true);

-- Chính sách cho phép người dùng đã xác thực xóa lookbook.
CREATE POLICY "Allow authenticated users to delete lookbooks"
ON public.shop_looks
FOR DELETE
TO authenticated
USING (true);


-- Giai đoạn 2: Chạy script cứu dữ liệu SAU KHI các chính sách bảo mật đã được thiết lập.
-- Gán một danh mục mặc định cho tất cả các lookbook "mồ côi".

DO $$
DECLARE
    default_category_id UUID;
BEGIN
    -- Tìm ID của danh mục chính đầu tiên để làm mặc định.
    SELECT id INTO default_category_id
    FROM public.categories
    WHERE parent_id IS NULL AND menu_location = 'main'
    ORDER BY display_order, name
    LIMIT 1;

    -- Nếu tìm thấy danh mục mặc định, cập nhật tất cả lookbook chưa có danh mục.
    IF default_category_id IS NOT NULL THEN
        UPDATE public.shop_looks
        SET category_id = default_category_id
        WHERE category_id IS NULL;
    END IF;
END $$;