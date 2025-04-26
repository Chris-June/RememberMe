/*
  # Create storage buckets for the application
  
  1. New Buckets:
    - `memorial-covers` - For storing memorial cover images
    - `memory-media` - For storing memory-related media like photos
  
  2. Security
    - Enable public access for all buckets
    - Set up proper RLS policies
*/

-- Create the memorial-covers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memorial-covers', 'memorial-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create the memory-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-media', 'memory-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create a policy that allows authenticated users to upload to their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('memorial-covers', 'memory-media')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy that allows users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('memorial-covers', 'memory-media')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy that allows users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('memorial-covers', 'memory-media')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy that allows authenticated users to read all objects
CREATE POLICY "Public read access for memorial images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id IN ('memorial-covers', 'memory-media')
);