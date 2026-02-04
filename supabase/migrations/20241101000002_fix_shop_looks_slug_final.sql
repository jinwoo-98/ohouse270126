-- 1. Thêm cột slug nếu chưa có
ALTER TABLE public.shop_looks 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Đảm bảo tính duy nhất cho slug (để tránh 2 lookbook trùng link)
DROP INDEX IF EXISTS shop_looks_slug_idx;
CREATE UNIQUE INDEX shop_looks_slug_idx ON public.shop_looks (slug);

-- 3. Cấp quyền cho user đã đăng nhập được phép sửa cột này
GRANT ALL ON TABLE public.shop_looks TO authenticated;
GRANT ALL ON TABLE public.shop_looks TO service_role;

-- 4. QUAN TRỌNG NHẤT: Bắt buộc API tải lại cấu hình ngay lập tức
NOTIFY pgrst, 'reload config';