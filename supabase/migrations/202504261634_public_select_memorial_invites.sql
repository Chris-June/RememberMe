-- Migration: Allow public SELECT on memorial_invites for troubleshooting 406 errors
-- Created at 2025-04-26

-- This policy allows anyone to select from memorial_invites (for debugging)
-- You can restrict this to authenticated users if needed
CREATE POLICY "Allow public select on memorial_invites for debugging"
  ON public.memorial_invites
  FOR SELECT
  TO public
  USING (true);

-- If you want to restrict to authenticated users, use:
-- CREATE POLICY "Allow authenticated select on memorial_invites"
--   ON public.memorial_invites
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Don't forget to enable RLS if not already enabled:
ALTER TABLE public.memorial_invites ENABLE ROW LEVEL SECURITY;
