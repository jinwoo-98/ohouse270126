-- Remove the overly permissive public insert policy
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;

-- Ensure the authenticated policy is correctly defined
-- This policy allows authenticated users to insert reviews where the user_id matches their own ID
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Also ensure users can only update/delete their own reviews (if needed in the future)
DROP POLICY IF EXISTS "Admin/Editor can update reviews" ON public.reviews;
CREATE POLICY "Admin/Editor can update reviews" ON public.reviews
FOR UPDATE TO authenticated 
USING (is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin/Editor can delete reviews" ON public.reviews;
CREATE POLICY "Admin/Editor can delete reviews" ON public.reviews
FOR DELETE TO authenticated 
USING (is_admin() OR auth.uid() = user_id);