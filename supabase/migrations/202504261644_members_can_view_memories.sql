-- Migration: Allow memorial members to view all memories for their memorials
-- Created at 2025-04-26

-- Allow any user who is a member of a memorial to view all memories for that memorial
CREATE POLICY "Members can view all memories for their memorials"
  ON public.memories
  FOR SELECT
  TO public
  USING (
    memorialid IN (
      SELECT memorial_id FROM memorial_members WHERE user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled (if not already)
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
