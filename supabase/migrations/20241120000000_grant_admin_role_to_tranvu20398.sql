-- supabase/migrations/20241120000000_grant_admin_role_to_tranvu20398.sql
-- Grant 'admin' role to the user with email tranvu20398@gmail.com

DO $$
DECLARE
    user_id_to_update uuid;
BEGIN
    -- 1. Find the user ID in auth.users table
    SELECT id INTO user_id_to_update
    FROM auth.users
    WHERE email = 'tranvu20398@gmail.com';

    -- 2. If the user exists, update their role in the public.profiles table
    IF user_id_to_update IS NOT NULL THEN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = user_id_to_update;
    END IF;
END $$;