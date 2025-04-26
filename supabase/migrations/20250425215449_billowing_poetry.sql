/*
  # Fix ambiguous column reference in generate_invite_code function
  
  1. Changes
    - Update the generate_invite_code function to properly qualify the column reference
    - Fix the "code" ambiguity by explicitly referencing memorial_invites.code
  
  2. Security
    - No changes to security policies
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS generate_invite_code();

-- Create a new version with fixed column references
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  generated_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    generated_code := substring(md5(random()::text), 1, 8);
    SELECT EXISTS(
      SELECT 1 FROM memorial_invites WHERE memorial_invites.code = generated_code
    ) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN generated_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;