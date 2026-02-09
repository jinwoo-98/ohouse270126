-- Step 1: Ensure all existing lookbooks are marked as active.
-- This is a safeguard to ensure visibility.
UPDATE public.shop_looks
SET is_active = true
WHERE is_active IS NOT true;

-- Step 2: Drop all existing policies on the table to start fresh.
-- This prevents any potential conflicts with old or incorrect policies.
DROP POLICY IF EXISTS "Public read access for active looks" ON public.shop_looks;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.shop_looks;
DROP POLICY IF EXISTS "Public read access" ON public.shop_looks;
DROP POLICY IF EXISTS "Admin full access" ON public.shop_looks;

-- Step 3: Enable Row Level Security if it's not already enabled.
ALTER TABLE public.shop_looks ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a simple, permissive policy for PUBLIC read access.
-- This allows anyone to read any row. The frontend code will handle filtering for `is_active`.
CREATE POLICY "Public read access" ON public.shop_looks
FOR SELECT USING (true);

-- Step 5: Create a policy that allows authenticated users (admins, editors) to do everything.
-- This ensures that you can still manage lookbooks from the admin panel.
CREATE POLICY "Admin full access" ON public.shop_looks
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);