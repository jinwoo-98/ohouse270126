-- Drop the incorrect, overly restrictive policy on app_secrets
DROP POLICY IF EXISTS "Allow service_role access" ON public.app_secrets;

-- Ensure RLS is enabled. With no policies, this table is now only accessible
-- by the service_role_key, which is the correct and secure setup for a secrets table.
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Re-grant permissions to the service role to be explicit, although it bypasses RLS.
-- This ensures clarity in permissions.
GRANT ALL ON TABLE public.app_secrets TO service_role;