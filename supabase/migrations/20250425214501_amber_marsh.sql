-- Create or replace function to generate invite codes with fixed variable name
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  generated_code TEXT; -- Changed from 'code' to 'generated_code'
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