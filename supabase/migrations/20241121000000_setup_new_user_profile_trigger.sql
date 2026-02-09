-- 1. Create a function to automatically insert a new user into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

-- 2. Create a trigger that fires the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Manually fix the profile for the existing user 'tranvu20398@gmail.com'
-- This ensures the user who reported the issue can log in immediately.
DO $$
DECLARE
    user_id_to_fix uuid;
BEGIN
    -- Find the user ID from the email
    SELECT id INTO user_id_to_fix
    FROM auth.users
    WHERE email = 'tranvu20398@gmail.com';

    -- If the user exists, ensure their profile is created and has the admin role.
    IF user_id_to_fix IS NOT NULL THEN
        -- Upsert logic: Insert if not exists, update if it exists but has the wrong role.
        INSERT INTO public.profiles (id, email, role)
        VALUES (user_id_to_fix, 'tranvu20398@gmail.com', 'admin')
        ON CONFLICT (id) 
        DO UPDATE SET role = 'admin';
    END IF;
END $$;