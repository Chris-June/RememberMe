import { supabase } from './supabase';
// import { toast } from '../components/ui/toaster'; // Commented out: toast cannot be used in utility files

/**
 * Generate a new invite code for a memorial
 */
export async function generateInviteCode(memorialId: string): Promise<{ 
  success: boolean; 
  code?: string; 
  error?: string 
}> {
  // Note: This function now triggers toast notifications for both success and error cases.

  try {
    // Verify the user can create invites for this memorial
    const { data: memorial, error: memorialError } = await supabase
      .from('memorials')
      .select('*')
      .eq('id', memorialId)
      .single();

    if (memorialError || !memorial) {
      console.error('Error verifying memorial access:', memorialError);
      let errorMessage = 'An unexpected error occurred';
      if (memorialError instanceof Error) {
        errorMessage = memorialError.message;
      }
      /*
toast({
  title: 'Error',
  description: errorMessage,
  variant: 'destructive',
});
*/
      return { success: false, error: errorMessage };
    }

    // Make sure invites are allowed for this memorial
    if (memorial.allow_invites === false) {
      /*
toast({
  title: 'Invites Not Allowed',
  description: 'Invites are not allowed for this memorial',
  variant: 'destructive',
});
*/
      return { success: false, error: 'Invites are not allowed for this memorial' };
    }

    // Get the user's ID from the session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      /*
      /* toast({
        title: 'Authentication Required',
        description: 'You must be signed in to create an invite.',
        variant: 'destructive',
      });
      */
      return { success: false, error: 'Authentication required' };
    }

    // Call the function to generate an invite code
    const { data, error } = await supabase
      .rpc('generate_invite_code');

    if (error) {
      console.error('Error generating invite code:', error);
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      /*
      /* toast({
        title: 'Error Generating Invite',
        description: errorMessage,
        variant: 'destructive',
      });
      */
      return { success: false, error: errorMessage };
    }

    const code = data;

    // Insert the new invite
    const { data: invite, error: inviteError } = await supabase
      .from('memorial_invites')
      .insert({
        memorial_id: memorialId,
        code,
        created_by: user.id
      })
      .select('code')  // Just select 'code' without the table name
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      let errorMessage = 'An unexpected error occurred';
      if (inviteError instanceof Error) {
        errorMessage = inviteError.message;
      }
      return { success: false, error: errorMessage };
    }

    /*
toast({
  title: 'Invite Created',
  description: `Invite code: ${invite.code}`,
  variant: 'success',
});
*/
    return {
      success: true,
      code: invite.code
    };
  } catch (error: unknown) {
    console.error('Error generating invite code:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    /*
toast({
  title: 'Error',
  description: errorMessage,
  variant: 'destructive',
});
*/
    return { success: false, error: errorMessage };
  }
}

/**
 * Join a memorial using an invite code
 */
export async function joinMemorialByInvite(inviteCode: string): Promise<{
  success: boolean;
  memorialId?: string;
  memorialName?: string;
  error?: string;
}> {
  try {
    // 1. Lookup the invite by code
    const { data: invite, error: inviteError } = await supabase
      .from('memorial_invites')
      .select('memorial_id')
      .eq('code', inviteCode)
      .single();

    if (inviteError || !invite) {
      return { success: false, error: 'Invalid or expired invite code.' };
    }

    // 2. Lookup the memorial by id
    const { data: memorial, error: memorialError } = await supabase
      .from('memorials')
      .select('id, fullname')
      .eq('id', invite.memorial_id)
      .single();

    if (memorialError || !memorial) {
      return { success: false, error: 'Memorial not found.' };
    }

    // 3. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    // 3. Check if user is already a member
    const { data: existing } = await supabase
      .from('memorial_members')
      .select('id')
      .eq('memorial_id', memorial.id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      // 4. Add user as member if not already
      const { error: insertError } = await supabase
        .from('memorial_members')
        .insert([{ memorial_id: memorial.id, user_id: user.id }]);
      if (insertError) {
        console.error('Error joining memorial:', insertError);
        let errorMessage = 'An unexpected error occurred';
        if (insertError instanceof Error) {
          errorMessage = insertError.message;
        }
        return { success: false, error: errorMessage };
      }
    }

    return { 
      success: true, 
      memorialId: memorial.id, 
      memorialName: memorial.fullname 
    };
  } catch (error: unknown) {
    console.error('Error joining memorial:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if a user is a member of a memorial
 */
export async function checkMemorialAccess(memorialId: string): Promise<{
  hasAccess: boolean;
  isOwner: boolean;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { hasAccess: false, isOwner: false, error: 'Authentication required' };
    }

    // First check if user is the owner
    const { data: memorial, error: memorialError } = await supabase
      .from('memorials')
      .select('user_id, privacy')
      .eq('id', memorialId)
      .single();

    if (memorialError) {
      return { hasAccess: false, isOwner: false, error: 'Memorial not found' };
    }

    const isOwner = memorial.user_id === user.id;
    
    // If public or owner, they definitely have access
    if (memorial.privacy === 'public' || isOwner) {
      return { hasAccess: true, isOwner };
    }

    // Otherwise check if they're a member
    const { data: membership, error: membershipError } = await supabase
      .from('memorial_members')
      .select('id')
      .eq('memorial_id', memorialId)
      .eq('user_id', user.id)
      .single();

    return { 
      hasAccess: !!membership && !membershipError, 
      isOwner
    };
  } catch (error: unknown) {
    console.error('Error checking memorial access:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { 
      hasAccess: false, 
      isOwner: false, 
      error: errorMessage 
    };
  }
}