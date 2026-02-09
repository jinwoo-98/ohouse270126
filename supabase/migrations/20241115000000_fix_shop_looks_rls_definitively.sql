-- Step 1: Enable Row Level Security on the table.
-- This is the master switch that activates the security layer.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Step 2: Create a policy to allow public read access.
-- This policy explicitly tells Supabase that anyone (even unauthenticated users)
-- can read (SELECT) data from this table. This is safe for public content.
-- We drop the policy first to ensure this script can be run multiple times without error.
DROP POLICY IF EXISTS "Public read access for shop_looks" ON public.shop_looks;
CREATE POLICY "Public read access for shop_looks" ON public.shop_looks
FOR SELECT
USING (true);