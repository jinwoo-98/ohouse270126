-- Enable Row Level Security on the shop_looks table for enhanced security.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public, read-only access to all lookbooks.
-- This is necessary for the website to display lookbook data to all visitors.
CREATE POLICY "Allow public read access to all shop looks"
ON public.shop_looks
FOR SELECT
USING (true);