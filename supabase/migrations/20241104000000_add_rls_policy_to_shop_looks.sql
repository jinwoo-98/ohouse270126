-- Enable Row Level Security on the shop_looks table
-- This is a crucial security step. By default, tables are public.
-- Enabling RLS locks down the table, and data can only be accessed if a policy allows it.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public, read-only access to all lookbooks.
-- This policy is necessary for the website to display the lookbooks to visitors.
-- It allows SELECT (read) operations for everyone (USING (true)).
-- It does NOT allow insert, update, or delete operations from the public website.
CREATE POLICY "Allow public read access to all lookbooks"
ON public.shop_looks
FOR SELECT
USING (true);