-- This migration forces the PostgREST schema cache to reload.
-- It's a workaround for the persistent "Could not find the 'column' in the schema cache" error.
NOTIFY pgrst, 'reload schema';