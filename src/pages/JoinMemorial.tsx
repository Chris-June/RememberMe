import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Users, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';
import { joinMemorialByInvite } from '../lib/invites';

const JoinMemorial = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  
  const [isJoining, setIsJoining] = useState(false);
  const [joinedMemorialId, setJoinedMemorialId] = useState<string | null>(null);
  const [joinedMemorialName, setJoinedMemorialName] = useState<string | null>(null);
  
  useEffect(() => {
    // Store invite code in session storage before redirecting to signin
    if (code) {
      sessionStorage.setItem('pendingInvite', code);
    }
    
    // Wait until auth state is resolved
    if (isAuthLoading) return;
    
    // If user is not logged in, redirect to sign in page
    if (!user) {
      navigate('/sign-in', { 
        state: { 
          from: `/memorial/join/${code}`,
          isInvite: true,
          inviteCode: code
        },
        replace: true
      });
      return;
    }
    
    // User is logged in and we have a code, process the invite
    if (code) {
      handleJoinMemorial(code);
    }
  }, [code, user, isAuthLoading, navigate]);
  
  const handleJoinMemorial = async (inviteCode: string) => {
    setIsJoining(true);
    
    try {
      const result = await joinMemorialByInvite(inviteCode);
      
      if (result.success) {
        setJoinedMemorialId(result.memorialId || null);
        setJoinedMemorialName(result.memorialName || null);
        
        toast({
          title: "Success",
          description: `You have joined ${result.memorialName}'s memorial.`,
          variant: "success",
        });
        
        // Clear the stored invite code
        sessionStorage.removeItem('pendingInvite');
      } else {
        toast({
          title: "Could Not Join Memorial",
          description: result.error || "The invite code may be invalid or expired.",
          variant: "destructive",
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error("Error joining memorial:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            {isJoining ? (
              <div>
                <Loader size={40} className="animate-spin text-memorial-500 mx-auto mb-4" />
                <h2 className="text-xl font-serif text-memorial-800 mb-2">Joining Memorial</h2>
                <p className="text-neutral-600">Please wait while we process your invitation...</p>
              </div>
            ) : joinedMemorialId ? (
              <div>
                <Users size={48} className="text-memorial-500 mx-auto mb-6" />
                <h2 className="text-2xl font-serif text-memorial-800 mb-4">
                  You've Been Added to the Memorial
                </h2>
                <p className="text-neutral-600 mb-6">
                  You can now access and contribute to {joinedMemorialName}'s memorial.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate(`/memorial/${joinedMemorialId}`)}
                    className="btn-primary"
                  >
                    View Memorial
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <LinkIcon size={48} className="text-memorial-500 mx-auto mb-6" />
                <h2 className="text-2xl font-serif text-memorial-800 mb-4">Processing Invitation</h2>
                <p className="text-neutral-600 mb-6">
                  Please wait while we process your invitation...
                </p>
                <Loader size={32} className="animate-spin text-memorial-500 mx-auto" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinMemorial;