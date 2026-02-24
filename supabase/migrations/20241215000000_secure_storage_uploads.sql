-- Ensure the uploads bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', true, 2097152, '{image/jpeg,image/png,image/webp,image/gif}')
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,image/gif}';

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for the uploads bucket to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- 1. Public Read Access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- 2. Restricted Upload Access (Only Admins/Editors, with strict type/size checks)
CREATE POLICY "Admin Upload Access" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor') AND
  (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif'))
);

-- 3. Restricted Delete Access
CREATE POLICY "Admin Delete Access" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'uploads' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
);