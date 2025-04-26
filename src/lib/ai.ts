import { supabase } from './supabase';

interface GenerateNarrativeParams {
  memorialId: string;
}

// Rate limiting constants
const RATE_LIMIT_MINUTES = 1;
const RATE_LIMIT_STORAGE_KEY = 'last_narrative_generation_timestamp';

export async function generateNarrative({ memorialId }: GenerateNarrativeParams) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }
    
    // Check if the rate limit has been exceeded
    const canGenerateNarrative = await checkRateLimit();
    if (!canGenerateNarrative.allowed) {
      return {
        success: false,
        error: canGenerateNarrative.message,
        timeRemaining: canGenerateNarrative.timeRemaining
      };
    }
    
    // First check if there are memories for this memorial
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('memorialid', memorialId);
    
    if (memoriesError) {
      console.error('Error checking memories:', memoriesError);
      throw new Error(`Error checking memories: ${memoriesError.message}`);
    }
    
    if (!memories || memories.length === 0) {
      throw new Error('No memories found for this memorial. Please add memories before generating a narrative.');
    }
    
    // Log the number of memories found for debugging
    console.log(`Found ${memories.length} memories for memorial ID: ${memorialId}`);
    
    // Log first few memories for debugging
    if (memories.length > 0) {
      console.log('Memory examples:');
      memories.slice(0, 2).forEach((memory, index) => {
        console.log(`Memory ${index + 1}:`, {
          content: memory.content.substring(0, 50) + '...',
          relationship: memory.relationship,
          emotion: memory.emotion,
          contributorName: memory.contributorname
        });
      });
    }
    
    try {
      console.log('Calling narrative generation edge function with session token');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-narrative`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            memorialId,
            // Extract only the fields we need to avoid circular references
            memories: memories.map(memory => ({
              id: memory.id,
              content: memory.content,
              relationship: memory.relationship,
              timePeriod: memory.timeperiod,
              emotion: memory.emotion,
              contributorName: memory.contributorname
            }))
          }),
        }
      );
      
      console.log('Edge function response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        
        let errorMessage = `HTTP error ${response.status}`;
        
        try {
          // Try to parse as JSON, but don't fail if it's not JSON
          const errorData = JSON.parse(errorText);
          console.error('Parsed error data:', errorData);
          errorMessage = errorData.error || errorMessage;
          
          // If this is a rate limit error, return the time remaining
          if (errorData.rateLimited && errorData.timeRemaining) {
            return {
              success: false,
              error: errorMessage,
              timeRemaining: errorData.timeRemaining
            };
          }
          
          if (errorData.details) {
            console.error('Error details:', errorData.details);
          }
        } catch (e) {
          // If it's not JSON, use the raw text
          console.error('Error is not JSON format:', e);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(`Failed to generate narrative: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Narrative generated successfully, length:', data.narrative?.length || 0);
      
      // Store the current timestamp for rate limiting
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, Date.now().toString());
      
      // Verify that narrative is not null or undefined before updating
      if (!data.narrative) {
        throw new Error('Generated narrative is empty or undefined');
      }
      
      console.log('About to update memorial with narrative:', {
        memorialId,
        narrativeLength: data.narrative.length,
        narrativePreview: data.narrative.substring(0, 100) + '...'
      });
      
      // First check if the user has permission to update this memorial
      const { data: memorial, error: memorialError } = await supabase
        .from('memorials')
        .select('user_id, id')
        .eq('id', memorialId)
        .single();
        
      if (memorialError) {
        console.error('Error checking memorial access:', memorialError);
        throw new Error(`Error checking memorial access: ${memorialError.message}`);
      }
      
      if (!memorial) {
        throw new Error(`Memorial with ID ${memorialId} not found`);
      }
      
      // Explicitly verify the current user is the owner of the memorial
      if (memorial.user_id !== session.user.id) {
        console.error('Permission denied: User is not the owner of this memorial', {
          memorialUserId: memorial.user_id,
          currentUserId: session.user.id
        });
        throw new Error('You do not have permission to update this memorial');
      }
      
      // Use ainarrative (lowercase) to match database column name
      console.log('Updating memorial with narrative in database');
      const { data: updateData, error: updateError } = await supabase
        .from('memorials')
        .update({ ainarrative: data.narrative })
        .eq('id', memorialId)
        .select();
      
      if (updateError) {
        // Log the full error object for debugging
        console.error('Error updating memorial narrative:', updateError);
        console.error('Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        const errorDetails = updateError.message || updateError.details || JSON.stringify(updateError);
        throw new Error(`Error updating memorial: ${errorDetails}`);
      }
      
      if (!updateData || updateData.length === 0) {
        console.warn('Update succeeded but no data returned');
      } else {
        console.log('Memorial updated successfully with narrative');
      }
      
      return {
        success: true,
        narrative: data.narrative,
      };
    } catch (fetchError) {
      console.error('Error in edge function call:', fetchError);
      throw new Error(fetchError instanceof Error ? fetchError.message : 'Error communicating with AI service');
    }
  } catch (error) {
    console.error('Error generating narrative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Function to check if a new narrative generation is allowed based on rate limiting
async function checkRateLimit() {
  const lastGenerationTime = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  
  if (!lastGenerationTime) {
    return { allowed: true };
  }
  
  const lastTimestamp = parseInt(lastGenerationTime, 10);
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - lastTimestamp) / (1000 * 60);
  
  if (elapsedMinutes < RATE_LIMIT_MINUTES) {
    const remainingMinutes = Math.ceil(RATE_LIMIT_MINUTES - elapsedMinutes);
    const remainingSeconds = Math.ceil((RATE_LIMIT_MINUTES - elapsedMinutes) * 60);
    
    return { 
      allowed: false, 
      message: `Please wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} before generating another narrative.`,
      timeRemaining: remainingSeconds
    };
  }
  
  return { allowed: true };
}