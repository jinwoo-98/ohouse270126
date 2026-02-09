-- Function to safely set the role of a user in the public.profiles table
CREATE OR REPLACE FUNCTION public.set_user_role(user_email text, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- 1. Find the user ID from auth.users
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found in auth.users.', user_email;
        RETURN;
    END IF;

    -- 2. Upsert (Insert or Update) the profile with the desired role
    INSERT INTO public.profiles (id, email, role)
    VALUES (target_user_id, user_email, new_role)
    ON CONFLICT (id) DO UPDATE
    SET role = new_role, email = user_email; -- Update role if profile already exists

    RAISE NOTICE 'Successfully set role of user % to %.', user_email, new_role;
END;
$$;

-- Execute the function to set the role for the specific user
SELECT public.set_user_role('tranvu20398@gmail.com', 'admin');

-- Clean up the temporary function (optional but good practice)
DROP FUNCTION public.set_user_role(user_email text, new_role text);