-- Add policy to allow admins and editors to update any profile
-- This is required for the Team Management feature to function correctly
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin());