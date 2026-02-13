-- Cho phép người dùng đã đăng nhập (Admin/Editor) có quyền thêm/sửa/xóa cấu hình
CREATE POLICY "Allow authenticated users to manage site settings" 
ON public.site_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);