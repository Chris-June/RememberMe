-- Add the tone column with default value
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'warm';

-- Add the style column with default value
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'conversational';

COMMENT ON COLUMN public.memorials.tone IS 'The emotional tone to use for the narrative (e.g., warm, reflective, humorous)';
COMMENT ON COLUMN public.memorials.style IS 'The writing style to use for the narrative (e.g., conversational, formal, poetic)';