-- 1. Khắc phục lỗi thiếu quyền quản trị cho Admin trên các bảng tương tác
-- Bảng contact_messages
CREATE POLICY "Admin can manage contact messages" ON public.contact_messages
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Bảng subscribers
CREATE POLICY "Admin can manage subscribers" ON public.subscribers
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Bảng design_requests
CREATE POLICY "Admin can manage design requests" ON public.design_requests
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Cải thiện quyền tự quản lý cho người dùng cuối
-- Cho phép người dùng tự cập nhật/xóa đánh giá của chính mình
CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Cho phép người dùng cập nhật đơn hàng của chính mình (ví dụ: để hủy đơn khi còn pending)
CREATE POLICY "Users can update their own orders" ON public.orders
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);