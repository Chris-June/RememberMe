-- Migration: Allow public SELECT on memorials for debugging
-- Created at 2025-04-26

-- This policy allows anyone to select from memorials (for debugging)
-- You can restrict this to authenticated users if needed
CREATE POLICY "Allow public select on memorials for debugging"
  ON public.memorials
  FOR SELECT
  TO public
  USING (true);

-- If you want to restrict to authenticated users, use:
-- CREATE POLICY "Allow authenticated select on memorials"
--   ON public.memorials
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Don't forget to enable RLS if not already enabled:
ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;
