-- Critical Security Fix: Prevent Privilege Escalation
-- This migration ensures that only users with the 'admin' role can modify the 'role' and 'permissions' columns.
-- It also allows admins and editors to update other users' profiles (e.g., for name changes), 
-- while still protecting the sensitive role-based columns via the trigger.

-- 1. Create the security trigger function
CREATE OR REPLACE FUNCTION public.handle_profile_update_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply restrictions to updates coming from the authenticated API role
  IF auth.role() = 'authenticated' THEN
    -- Check if sensitive fields (role or permissions) are being modified
    IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.permissions IS DISTINCT FROM OLD.permissions) THEN
      -- Only allow the change if the requester currently has the 'admin' role
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        -- Silently revert the sensitive fields to their original values
        NEW.role := OLD.role;
        NEW.permissions := OLD.permissions;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS tr_protect_profile_roles ON public.profiles;
CREATE TRIGGER tr_protect_profile_roles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_update_security();

-- 3. Ensure admins and editors can update profiles via RLS
-- This is necessary for the Team Management panel to function.
-- The trigger above provides the actual security for the sensitive columns.
DROP POLICY IF EXISTS "Admin/Editor update profiles" ON public.profiles;
CREATE POLICY "Admin/Editor update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_admin());