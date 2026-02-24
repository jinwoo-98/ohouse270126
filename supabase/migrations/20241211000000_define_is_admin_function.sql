-- Định nghĩa hàm kiểm tra quyền quản trị viên
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'editor')
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

-- Đảm bảo RLS được bật cho các bảng quan trọng và áp dụng hàm này
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Chính sách cho phép admin xem tất cả hồ sơ
DROP POLICY IF EXISTS "Admin select all profiles" ON public.profiles;
CREATE POLICY "Admin select all profiles" ON public.profiles
FOR SELECT TO authenticated USING (is_admin());