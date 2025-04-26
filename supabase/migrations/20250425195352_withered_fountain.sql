/*
  # Create and configure storage buckets
  
  1. New Storage Buckets
    - memorial-covers: For memorial profile images
    - memory-media: For media attached to memories
  
  2. Security
    - Enable public access to view images
    - Set appropriate RLS policies for upload/update/delete
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'memorial-covers', 
    'Memorial Cover Images', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
  )
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'memory-media', 
    'Memory Media Files', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
  )
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access for memorial covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload memorial covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own memorial covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own memorial covers" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access for memory media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload memory media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own memory media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own memory media" ON storage.objects;

-- Create more specific policies with proper security scoped by bucket
-- Memorial covers bucket policies
CREATE POLICY "Allow public read access for memorial covers" 
ON storage.objects 
FOR SELECT
TO public 
USING (bucket_id = 'memorial-covers');

CREATE POLICY "Allow authenticated users to upload memorial covers" 
ON storage.objects 
FOR INSERT
TO authenticated 
WITH CHECK (
  bucket_id = 'memorial-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own memorial covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memorial-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own memorial covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'memorial-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Memory media bucket policies
CREATE POLICY "Allow public read access for memory media" 
ON storage.objects 
FOR SELECT
TO public 
USING (bucket_id = 'memory-media');

CREATE POLICY "Allow authenticated users to upload memory media" 
ON storage.objects 
FOR INSERT
TO authenticated 
WITH CHECK (
  bucket_id = 'memory-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own memory media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memory-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own memory media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'memory-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);