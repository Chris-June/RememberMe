import { supabase } from './supabase';
import { Memorial, Memory, Comment } from '../types';

/**
 * Deletes a memory by its ID via the Supabase Edge Function.
 * Requires the user to be authenticated; only the owner can delete their memory.
 * @param memoryId - The ID of the memory to delete
 * @returns {Promise<{ success: boolean; error?: string }>} Result of the deletion
 */
export async function deleteMemory(memoryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current user's access token
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return { success: false, error: 'User not authenticated' };
    }
    const accessToken = session.access_token;

    // Call the Edge Function endpoint
    const response = await fetch('/functions/v1/generate-narrative?memoryId=' + encodeURIComponent(memoryId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return { success: false, error: result.error || 'Failed to delete memory' };
    }
    return { success: true };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error deleting memory:', error);
    return { success: false, error: message };
  }
}

export async function createMemorial(memorialData: Partial<Memorial>): Promise<{ success: boolean; memorial?: Memorial; error?: string }> {
  try {
    // Transform camelCase properties to match database column names
    const dbData = {
      fullname: memorialData.fullName,
      birthdate: memorialData.birthDate,
      passeddate: memorialData.passedDate,
      description: memorialData.description,
      privacy: memorialData.privacy,
      coverimage: memorialData.coverImage,
      user_id: memorialData.user_id,
      tone: memorialData.tone,
      style: memorialData.style
    };

    const { data, error } = await supabase
      .from('memorials')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating memorial:', error);
      return { success: false, error: error.message };
    }

    // Transform database column names back to camelCase for frontend
    const memorial: Memorial = {
      id: data.id,
      fullName: data.fullname,
      birthDate: data.birthdate,
      passedDate: data.passeddate,
      createdat: data.createdat,
      coverImage: data.coverimage,
      description: data.description,
      privacy: data.privacy,
      contributorCount: data.contributorcount || 0,
      memoryCount: data.memorycount || 0,
      aiNarrative: data.ainarrative || '', // Map ainarrative to aiNarrative
      tone: data.tone || 'warm',
      style: data.style || 'conversational',
      user_id: data.user_id
    };

    return { success: true, memorial };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error creating memorial:', error);
    return { success: false, error: message };
  }
}

export async function getMemorial(id: string): Promise<{ success: boolean; memorial?: Memorial; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('memorials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching memorial:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Memorial not found' };
    }

    // Transform database column names to camelCase for frontend
    const memorial: Memorial = {
      id: data.id,
      fullName: data.fullname,
      birthDate: data.birthdate,
      passedDate: data.passeddate,
      createdat: data.createdat,
      coverImage: data.coverimage,
      description: data.description,
      privacy: data.privacy,
      contributorCount: data.contributorcount || 0,
      memoryCount: data.memorycount || 0,
      aiNarrative: data.ainarrative || '', // Map ainarrative to aiNarrative for frontend
      tone: data.tone || 'warm',
      style: data.style || 'conversational',
      user_id: data.user_id
    };

    return { success: true, memorial };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error fetching memorial:', error);
    return { success: false, error: message };
  }
}

export async function getUserMemorials(userId: string): Promise<{ success: boolean; memorials?: Memorial[]; error?: string }> {
  try {
    console.log("Fetching memorials for user:", userId);
    
    // Fetch full memorial data for better user experience
    const { data, error } = await supabase
      .from('memorials')
      .select('*')
      .eq('user_id', userId)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching user memorials:', error);
      return { success: false, error: error.message };
    }

    console.log(`Found ${data?.length || 0} memorials for user`);

    // Transform database column names to camelCase for frontend
    const memorials: Memorial[] = data.map(item => ({
      id: item.id,
      fullName: item.fullname || '',
      birthDate: item.birthdate || '',
      passedDate: item.passeddate || '',
      createdat: item.createdat || new Date().toISOString(),
      coverImage: item.coverimage || '',
      description: item.description || '',
      privacy: item.privacy || 'family',
      contributorCount: item.contributorcount || 0,
      memoryCount: item.memorycount || 0,
      aiNarrative: item.ainarrative || '', 
      tone: item.tone || 'warm',
      style: item.style || 'conversational',
      user_id: item.user_id
    }));

    return { success: true, memorials };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error fetching user memorials:', error);
    return { success: false, error: message };
  }
}

export async function updateMemorial(id: string, memorialData: Partial<Memorial>): Promise<{ success: boolean; memorial?: Memorial; error?: string }> {
  try {
    // Transform camelCase properties to match database column names
    const dbData: Record<string, unknown> = {};
    
    if (memorialData.fullName !== undefined) dbData.fullname = memorialData.fullName;
    if (memorialData.birthDate !== undefined) dbData.birthdate = memorialData.birthDate;
    if (memorialData.passedDate !== undefined) dbData.passeddate = memorialData.passedDate;
    if (memorialData.description !== undefined) dbData.description = memorialData.description;
    if (memorialData.privacy !== undefined) dbData.privacy = memorialData.privacy;
    if (memorialData.coverImage !== undefined) dbData.coverimage = memorialData.coverImage;
    if (memorialData.aiNarrative !== undefined) dbData.ainarrative = memorialData.aiNarrative;
    if (memorialData.tone !== undefined) dbData.tone = memorialData.tone;
    if (memorialData.style !== undefined) dbData.style = memorialData.style;

    const { data, error } = await supabase
      .from('memorials')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating memorial:', error);
      return { success: false, error: error.message };
    }

    // Transform database column names to camelCase for frontend
    const memorial: Memorial = {
      id: data.id,
      fullName: data.fullname,
      birthDate: data.birthdate,
      passedDate: data.passeddate,
      createdat: data.createdat,
      coverImage: data.coverimage,
      description: data.description,
      privacy: data.privacy,
      contributorCount: data.contributorcount || 0,
      memoryCount: data.memorycount || 0,
      aiNarrative: data.ainarrative || '', // Map ainarrative to aiNarrative
      tone: data.tone || 'warm',
      style: data.style || 'conversational',
      user_id: data.user_id
    };

    return { success: true, memorial };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error updating memorial:', error);
    return { success: false, error: message };
  }
}

export async function deleteMemorial(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First, make sure all memories are deleted to avoid foreign key constraint violations
    const { error: memoriesError } = await supabase
      .from('memories')
      .delete()
      .eq('memorialid', id);

    if (memoriesError) {
      console.error('Error deleting associated memories:', memoriesError);
      return { success: false, error: `Failed to delete associated memories: ${memoriesError.message}` };
    }

    // Now delete the memorial
    const { error } = await supabase
      .from('memorials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting memorial:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error deleting memorial:', error);
    return { success: false, error: message };
  }
}

export async function getMemories(memorialId: string): Promise<{ success: boolean; memories?: Memory[]; error?: string }> {
  try {
    // First get the memories
    const { data: memoriesData, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('memorialid', memorialId)
      .order('createdat', { ascending: false });

    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError);
      return { success: false, error: memoriesError.message };
    }
    
    // Get current user to check if they've liked any memories
    const { data: { user } } = await supabase.auth.getUser();
    
    // If user is signed in, check which memories they've liked
    let userLikes: Record<string, boolean> = {};
    if (user) {
      const { data: likesData } = await supabase
        .from('memory_likes')
        .select('memory_id')
        .eq('user_id', user.id);
        
      if (likesData) {
        userLikes = likesData.reduce((acc: Record<string, boolean>, like) => {
          acc[like.memory_id] = true;
          return acc;
        }, {});
      }
    }
    
    // Get comments for all memories in a single query for better performance
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        memory_id,
        user_id,
        content,
        created_at
      `)
      .in('memory_id', memoriesData.map(m => m.id))
      .order('created_at', { ascending: true });
      
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      // Continue with the process even if comments fail to load
    }
    
    // Fetch usernames for all comment authors in a single query
    const userIds = commentsData ? [...new Set(commentsData.map(c => c.user_id))] : [];
    let usernamesByUserId: Record<string, string> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
        
      if (profilesData) {
        usernamesByUserId = profilesData.reduce((acc: Record<string, string>, profile) => {
          acc[profile.id] = profile.username || 'Anonymous';
          return acc;
        }, {});
      }
    }
    
    // Group comments by memory_id
    const commentsByMemoryId: Record<string, Comment[]> = {};
    if (commentsData) {
      commentsData.forEach(comment => {
        if (!commentsByMemoryId[comment.memory_id]) {
          commentsByMemoryId[comment.memory_id] = [];
        }
        
        commentsByMemoryId[comment.memory_id].push({
          id: comment.id,
          memoryId: comment.memory_id,
          userId: comment.user_id,
          userName: usernamesByUserId[comment.user_id] || 'Anonymous',
          content: comment.content,
          createdAt: comment.created_at
        });
      });
    }

    // Transform database column names to camelCase for frontend and add comments
    const memories: Memory[] = memoriesData.map(item => ({
      id: item.id,
      memorialId: item.memorialid,
      contributorId: item.contributorid,
      contributorName: item.contributorname,
      contributorAvatar: item.contributoravatar,
      relationship: item.relationship,
      content: item.content,
      date: item.date,
      timePeriod: item.timeperiod,
      emotion: item.emotion,
      mediaUrl: item.mediaurl,
      likes: item.likes || 0,
      hasLiked: userLikes[item.id] || false,
      comments: commentsByMemoryId[item.id] || [],
      createdAt: item.createdat
    }));

    return { success: true, memories };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error fetching memories:', error);
    return { success: false, error: message };
  }
}

export async function addMemory(memoryData: Partial<Memory>): Promise<{ success: boolean; memory?: Memory; error?: string }> {
  try {
    // Get the current user's ID from Supabase auth
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const userId = userData.user.id;
    
    // Check if we need to handle file upload
    let mediaUrl = memoryData.mediaUrl;
    if (mediaData && typeof mediaData !== 'string' && mediaData instanceof File) {
      // Create a blob URL instead of uploading to Supabase
      mediaUrl = URL.createObjectURL(mediaData);
    }
    
    // Ensure the contributorid matches the authenticated user's ID to satisfy RLS policy
    const dbData = {
      memorialid: memoryData.memorialId,
      contributorid: userId, // Use the authenticated user's ID
      contributorname: memoryData.contributorName,
      contributoravatar: memoryData.contributorAvatar,
      relationship: memoryData.relationship,
      content: memoryData.content,
      date: memoryData.date,
      timeperiod: memoryData.timePeriod,
      emotion: memoryData.emotion,
      mediaurl: mediaUrl
    };

    const { data, error } = await supabase
      .from('memories')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating memory:', error);
      return { success: false, error: error.message };
    }

    // Transform database column names to camelCase for frontend
    const memory: Memory = {
      id: data.id,
      memorialId: data.memorialid,
      contributorId: data.contributorid,
      contributorName: data.contributorname,
      contributorAvatar: data.contributoravatar,
      relationship: data.relationship,
      content: data.content,
      date: data.date,
      timePeriod: data.timeperiod,
      emotion: data.emotion,
      mediaUrl: data.mediaurl,
      likes: data.likes || 0,
      hasLiked: false,
      comments: [],
      createdAt: data.createdat
    };

    return { success: true, memory };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error creating memory:', error);
    return { success: false, error: message };
  }
}

export async function getUserMemories(userId: string): Promise<{ success: boolean; memories?: Memory[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('contributorid', userId)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching user memories:', error);
      return { success: false, error: error.message };
    }

    // Transform database column names to camelCase for frontend
    const memories: Memory[] = data.map(item => ({
      id: item.id,
      memorialId: item.memorialid,
      contributorId: item.contributorid,
      contributorName: item.contributorname,
      contributorAvatar: item.contributoravatar,
      relationship: item.relationship,
      content: item.content,
      date: item.date,
      timePeriod: item.timeperiod,
      emotion: item.emotion,
      mediaUrl: item.mediaurl,
      likes: item.likes || 0,
      hasLiked: false,
      comments: [],
      createdAt: item.createdat
    }));

    return { success: true, memories };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error fetching user memories:', error);
    return { success: false, error: message };
  }
}

export async function toggleMemoryLike(memoryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current user's ID from Supabase auth
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const userId = userData.user.id;
    
    // Check if the user has already liked this memory
    const { data: existingLike, error: checkError } = await supabase
      .from('memory_likes')
      .select('id')
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking like status:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (existingLike) {
      // User has already liked, so unlike
      const { error: unlikeError } = await supabase
        .from('memory_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (unlikeError) {
        console.error('Error removing like:', unlikeError);
        return { success: false, error: unlikeError.message };
      }
      
      // Decrement the likes count in the memories table
      const { error: updateError } = await supabase.rpc(
        'decrement_memory_likes',
        { memory_id: memoryId }
      );
      
      if (updateError) {
        console.error('Error updating memory likes count:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // User hasn't liked, so add a like
      const { error: likeError } = await supabase
        .from('memory_likes')
        .insert({ memory_id: memoryId, user_id: userId });
        
      if (likeError) {
        console.error('Error adding like:', likeError);
        return { success: false, error: likeError.message };
      }
      
      // Increment the likes count in the memories table
      const { error: updateError } = await supabase.rpc(
        'increment_memory_likes',
        { memory_id: memoryId }
      );
      
      if (updateError) {
        console.error('Error updating memory likes count:', updateError);
        return { success: false, error: updateError.message };
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error toggling like:', error);
    return { success: false, error: message };
  }
}

export async function addComment(commentData: { memoryId: string; content: string }): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    // Get the current user's ID from Supabase auth
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const userId = userData.user.id;
    
    // Get the user's profile for username
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
      
    const username = profileData?.username || 'User';
    
    // Create the comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        memory_id: commentData.memoryId,
        user_id: userId,
        content: commentData.content
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating comment:', error);
      return { success: false, error: error.message };
    }
    
    // Return the new comment with the user's name
    const comment: Comment = {
      id: data.id,
      memoryId: data.memory_id,
      userId: data.user_id,
      userName: username,
      content: data.content,
      createdAt: data.created_at
    };
    
    return { success: true, comment };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error creating comment:', error);
    return { success: false, error: message };
  }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
      
    if (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: unknown) {
    let message = 'An unexpected error occurred';
    if (error instanceof Error) {
      message = error.message;
    }

    console.error('Error deleting comment:', error);
    return { success: false, error: message };
  }
}

// Helper to handle file uploads for memories
let mediaData: File | null = null;

export function setMemoryMediaFile(file: File | null) {
  mediaData = file;
}

// Create an alias for createMemory that points to addMemory for backward compatibility
export const createMemory = addMemory;