-- Cho phép Admin và Editor có toàn quyền trên bảng reviews (để tạo đánh giá mẫu)
CREATE POLICY "Admins and Editors can manage all reviews" ON public.reviews
FOR ALL TO authenticated
USING (is_admin());

-- Đảm bảo chính sách xem công khai vẫn hoạt động cho mọi người
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews
FOR SELECT USING (true);