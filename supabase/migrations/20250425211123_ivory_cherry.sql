/*
  # Add Tone and Style columns to memorials table
  
  1. Changes
    - Add tone column to memorials table
    - Add style column to memorials table
    
  2. Purpose
    - Allow users to customize the voice and tone of AI-generated narratives
    - Make memorial narratives feel more authentic and personalized
*/

-- Add the tone column with default value
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'warm';

-- Add the style column with default value
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'conversational';

COMMENT ON COLUMN public.memorials.tone IS 'The emotional tone to use for the narrative (e.g., warm, reflective, humorous)';
COMMENT ON COLUMN public.memorials.style IS 'The writing style to use for the narrative (e.g., conversational, formal, poetic)';