-- This migration forces the PostgREST schema cache to reload.
-- It's a workaround for issues where the API doesn't recognize new columns immediately.
NOTIFY pgrst, 'reload schema';