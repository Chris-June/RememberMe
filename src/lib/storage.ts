import { supabase } from './supabase';

// List of available buckets - if a bucket doesn't exist, we'll use the first one as a fallback
const AVAILABLE_BUCKETS = ['memorial-covers', 'memory-media', 'memorial-media', 'avatars'];
// removed DEFAULT_BUCKET as it was unused

/**
 * Helper function to upload a file to Supabase Storage
 * @param bucket The bucket name to upload to (e.g., 'memorial-covers', 'memory-media')
 * @param file The file to upload
 * @param userId The user ID to associate with the file
 * @returns Object containing success, url and error information
 */
export async function uploadFile(
  bucket: string,
  file: File, 
  userId: string
): Promise<{ 
  success: boolean; 
  url?: string;
  error?: string;
}> {
  try {
    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size too large. Maximum size is 5MB.`
      };
    }
    
    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`
      };
    }
    
    // Create a unique filename with timestamp and original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      
      // Use object URL as a fallback
      const objectUrl = URL.createObjectURL(file);
      
      return {
        success: false,
        url: objectUrl,
        error: `Storage error: ${bucketError.message}. Using temporary URL instead.`
      };
    }
    
    // Check if the requested bucket exists, otherwise use a fallback
    let uploadBucket = bucket;
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.warn(`Bucket not found: ${bucket}. Looking for available buckets.`);
      
      // Find first available bucket from our list
      const availableBucket = buckets?.find(b => AVAILABLE_BUCKETS.includes(b.name));
      
      if (availableBucket) {
        uploadBucket = availableBucket.name;
        console.log(`Using fallback bucket: ${uploadBucket}`);
      } else {
        // If no bucket from our list exists, create a fallback object URL
        const objectUrl = URL.createObjectURL(file);
        
        return {
          success: true,
          url: objectUrl,
          error: `No suitable storage bucket found. Using temporary URL.`
        };
      }
    }
    
    // Upload file to Supabase storage
    const { error: uploadError } = await supabase
      .storage
      .from(uploadBucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Fallback to object URL on upload error
      const objectUrl = URL.createObjectURL(file);
      
      return {
        success: true,
        url: objectUrl,
        error: `Storage upload failed, using temporary URL. Error: ${uploadError.message}`
      };
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(uploadBucket)
      .getPublicUrl(fileName);
      
    return {
      success: true,
      url: publicUrlData.publicUrl,
      error: uploadBucket !== bucket ? 
        `Note: Used '${uploadBucket}' bucket instead of '${bucket}' which doesn't exist.` : 
        undefined
    };
  } catch (error: unknown) {
    console.error('Unexpected error during file upload:', error);
    const message = error instanceof Error ? error.message : String(error);
    
    // Last resort fallback to object URL
    try {
      const objectUrl = URL.createObjectURL(file);
      
      return {
        success: true,
        url: objectUrl,
        error: `Storage error, using temporary URL: ${message}`
      };
    } catch {
      return {
        success: false,
        error: `Failed to handle image: ${message}`
      };
    }
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket The bucket name
 * @param path The path to the file
 * @returns Object containing success and error information
 */
export async function deleteFile(
  bucket: string, 
  path: string
): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    // Extract user ID from path to verify ownership
    const pathParts = path.split('/');
    const userId = pathParts[0];
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Security check: only allow deletion if user owns the file
    if (!user || user.id !== userId) {
      return {
        success: false,
        error: 'You do not have permission to delete this file'
      };
    }
    
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return {
        success: false,
        error: `Storage error: ${bucketError.message}`
      };
    }
    
    const bucketExists = buckets.some(b => b.name === bucket);
    if (!bucketExists) {
      console.error(`Bucket not found: ${bucket}`);
      return {
        success: false,
        error: `Bucket '${bucket}' does not exist`
      };
    }
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Unexpected error during file deletion:', error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message || 'An unexpected error occurred'
    };
  }
}

/**
 * Extract path from a Supabase storage URL
 * @param url The full Supabase storage URL
 * @param bucket The bucket name
 * @returns The path component or null if not a valid storage URL
 */
export function getPathFromUrl(url: string, bucket: string): string | null {
  try {
    if (!url) return null;
    
    // Check if it's a Supabase storage URL
    if (!url.includes(bucket)) return null;
    
    const urlObj = new URL(url);
    // Extract the path after the bucket name
    const pathRegex = new RegExp(`/storage/v1/object/public/${bucket}/(.+)`);
    const match = urlObj.pathname.match(pathRegex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}