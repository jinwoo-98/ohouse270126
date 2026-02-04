-- 1. Thêm cột updated_at vào bảng shop_looks nếu chưa có
ALTER TABLE public.shop_looks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Cấp quyền cho các role authenticated (người dùng đã đăng nhập) để có thể update cột này
GRANT ALL ON TABLE public.shop_looks TO authenticated;
GRANT ALL ON TABLE public.shop_looks TO service_role;

-- 3. QUAN TRỌNG: Buộc PostgREST tải lại cấu hình để nhận diện cột mới ngay lập tức
NOTIFY pgrst, 'reload config';