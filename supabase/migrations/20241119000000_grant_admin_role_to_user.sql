-- Cấp quyền admin cho người dùng có email tranvu20398@gmail.com
-- LƯU Ý: Người dùng phải đăng ký/đăng nhập ít nhất một lần để có ID trong bảng auth.users

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
    SELECT id
    FROM auth.users
    WHERE email = 'tranvu20398@gmail.com'
);

-- Nếu người dùng chưa tồn tại trong bảng profiles (nhưng đã có trong auth.users),
-- lệnh UPDATE trên sẽ không có tác dụng. Tuy nhiên, do có trigger handle_new_user,
-- việc này thường không xảy ra.