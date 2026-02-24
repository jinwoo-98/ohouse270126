-- 1. Redefine is_admin to be more robust and performant
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$$;

-- 2. Add policy to allow administrators/editors to update profiles
-- Note: The 'handle_profile_update_security' trigger already exists to 
-- restrict 'role' and 'permissions' changes to only those with role = 'admin'.
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Ensure administrators can also delete profiles if necessary
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

CREATE POLICY "Admins can delete all profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Verify selection policies (already exist but ensuring they are consistent)
-- The existing 'Admin/Editor select all profiles' policy already uses is_admin()