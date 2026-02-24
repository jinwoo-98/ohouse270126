-- Enforce file size and extension limits on the 'uploads' bucket
-- This prevents malicious users from bypassing client-side checks.
-- We also restrict upload/modify access to users with 'admin' or 'editor' roles.

-- 1. Drop existing policies for the 'uploads' bucket to ensure a clean state
-- Note: Storage policies reside in the 'storage.objects' table
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Restricted authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for uploads" ON storage.objects;
DROP POLICY IF EXISTS "Staff restricted uploads" ON storage.objects;
DROP POLICY IF EXISTS "Staff restricted updates" ON storage.objects;
DROP POLICY IF EXISTS "Staff restricted deletes" ON storage.objects;

-- 2. Policy for viewing: Allow public read access to the 'uploads' bucket
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- 3. Policy for inserting: Only staff (admin/editor) can upload, with strict limits
-- We use the existing public.is_admin() function for role verification
CREATE POLICY "Staff restricted uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  public.is_admin() AND
  (storage.get_size(objects) < 2097152) AND -- 2MB limit (2 * 1024 * 1024)
  (storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif']))
);

-- 4. Policy for updating: Only staff can update existing files, maintaining limits
CREATE POLICY "Staff restricted updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND public.is_admin())
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.get_size(objects) < 2097152) AND
  (storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif']))
);

-- 5. Policy for deleting: Only staff can delete files
CREATE POLICY "Staff restricted deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND public.is_admin());