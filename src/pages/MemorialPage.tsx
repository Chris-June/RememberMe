import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Heart, Share2, Users, MessageSquare, PenSquare, Loader, Settings } from 'lucide-react';
import { format } from 'date-fns';
import MemoryCard from '../components/memorial/MemoryCard';
import NarrativeSection from '../components/memorial/NarrativeSection';
import EmotionBadge from '../components/memorial/EmotionBadge';
import MemoryTimeline from '../components/memorial/MemoryTimeline';
import { useToast } from '../hooks/useToast';
import { getMemorial, getMemories, updateMemorial } from '../lib/memorials';
import { checkMemorialAccess } from '../lib/invites';
import { Memorial, Memory } from '../types';
import { useAuthStore } from '../store/authStore';
import ShareOptions from '../components/memorial/ShareOptions';

type TabType = 'narrative' | 'timeline' | 'gallery' | 'shares';

const MemorialPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('narrative');
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Check if the current user is the creator of the memorial
  const isCreator = user && memorial && memorial.user_id === user.id;
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchMemorialData(id);
    }
  }, [id]);

  const fetchMemorialData = async (memorialId: string) => {
    setIsLoading(true);
    try {
      // Fetch memorial data
      const memorialResult = await getMemorial(memorialId);
      if (!memorialResult.success || !memorialResult.memorial) {
        toast({
          title: "Failed to load memorial",
          description: memorialResult.error || "The memorial could not be found.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setMemorial(memorialResult.memorial);
      
      // Check access if not public
      if (memorialResult.memorial.privacy !== 'public' && user) {
        const accessResult = await checkMemorialAccess(memorialId);
        setHasAccess(accessResult.hasAccess);
        
        if (!accessResult.hasAccess && !accessResult.isOwner) {
          toast({
            title: "Access Restricted",
            description: "You don't have permission to view this memorial.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else if (memorialResult.memorial.privacy === 'public') {
        // Public memorials are accessible to everyone
        setHasAccess(true);
      }
      
      // Fetch memories
      const memoriesResult = await getMemories(memorialId);
      if (memoriesResult.success) {
        const fetchedMemories = memoriesResult.memories || [];
        setMemories(fetchedMemories);
        
        // Calculate total likes across all memories
        const likesCount = fetchedMemories.reduce((total, memory) => total + (memory.likes || 0), 0);
        setTotalLikes(likesCount);
      } else {
        toast({
          title: "Failed to load memories",
          description: memoriesResult.error || "There was a problem loading memories.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching memorial data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading the memorial.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  const handlePrivacyChange = async (privacy: string) => {
    if (!memorial || !id || !isCreator) return;
    
    try {
      const result = await updateMemorial(id, { privacy });
      
      if (result.success) {
        setMemorial({
          ...memorial,
          privacy
        });
        
        toast({
          title: "Privacy Updated",
          description: `Memorial is now ${privacy === 'public' ? 'public' : privacy === 'family' ? 'family only' : 'private'}.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to Update Privacy",
          description: result.error || "There was a problem updating privacy settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  const handleNarrativeUpdate = async (newNarrative: string) => {
    if (!memorial || !id) return;
    
    try {
      // Directly update the state first for immediate UI feedback
      setMemorial({
        ...memorial,
        aiNarrative: newNarrative
      });
      
      // Then update in the database
      const result = await updateMemorial(id, { aiNarrative: newNarrative });
      if (!result.success) {
        console.error("Error saving narrative to database:", result.error);
        toast({
          title: "Warning",
          description: "The narrative was generated but couldn't be saved permanently. Try refreshing the page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating narrative:", error);
    }
  };

  // Function to update memory and recalculate total likes
  const handleUpdateMemory = (updatedMemory: Memory) => {
    const updatedMemories = memories.map(memory => 
      memory.id === updatedMemory.id ? updatedMemory : memory
    );
    setMemories(updatedMemories);
    
    // Recalculate total likes
    const newTotalLikes = updatedMemories.reduce((total, memory) => total + (memory.likes || 0), 0);
    setTotalLikes(newTotalLikes);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-memorial-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading memorial...</p>
        </div>
      </div>
    );
  }

  if (!memorial || (!hasAccess && memorial.privacy !== 'public')) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-serif text-memorial-800 mb-4">Memorial Not Found or Restricted</h1>
          <p className="text-neutral-600 mb-6">
            The memorial you're looking for might have been removed or you don't have permission to view it.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <motion.section 
        className="relative h-[50vh] min-h-[400px] bg-neutral-900 text-white flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={memorial.coverImage} 
            alt={memorial.fullName} 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{memorial.fullName}</h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            {memorial.birthDate && format(new Date(memorial.birthDate), 'MMMM d, yyyy')} — {memorial.passedDate && format(new Date(memorial.passedDate), 'MMMM d, yyyy')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={`/memorial/${id}/add`} className="btn-warm flex items-center gap-2">
              <PenSquare size={18} /> Add Memory
            </Link>
            <button 
              className="btn-secondary flex items-center gap-2"
              onClick={() => handleTabChange('shares')}
            >
              <Share2 size={18} /> Share Memorial
            </button>
            {/* Only show settings button to creator */}
            {isCreator && (
              <Link 
                to={`/memorial/${id}/settings`}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings size={18} /> Settings
              </Link>
            )}
          </div>
        </div>
      </motion.section>
      
      {/* Memorial Statistics */}
      <section className="py-6 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-center gap-8">
            <div className="flex items-center gap-2">
              <Users className="text-memorial-500" />
              <span>{memorial.contributorCount} Contributors</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="text-memorial-500" />
              <span>{memorial.memoryCount} Memories</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-memorial-500" />
              <span>Created {format(new Date(memorial.createdat), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-warm-500" />
              <span>{totalLikes} Tributes</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tabs Navigation */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center border-b border-neutral-200 mb-8">
            <button 
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'narrative' 
                  ? 'text-memorial-600 border-b-2 border-memorial-600' 
                  : 'text-neutral-600 hover:text-memorial-500'
              }`}
              onClick={() => handleTabChange('narrative')}
            >
              Life Narrative
            </button>
            <button 
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'timeline' 
                  ? 'text-memorial-600 border-b-2 border-memorial-600' 
                  : 'text-neutral-600 hover:text-memorial-500'
              }`}
              onClick={() => handleTabChange('timeline')}
            >
              Memory Timeline
            </button>
            <button 
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'gallery' 
                  ? 'text-memorial-600 border-b-2 border-memorial-600' 
                  : 'text-neutral-600 hover:text-memorial-500'
              }`}
              onClick={() => handleTabChange('gallery')}
            >
              Photo Gallery
            </button>
            <button 
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'shares' 
                  ? 'text-memorial-600 border-b-2 border-memorial-600' 
                  : 'text-neutral-600 hover:text-memorial-500'
              }`}
              onClick={() => handleTabChange('shares')}
            >
              Share
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="container mx-auto px-4 max-w-5xl">
            {activeTab === 'narrative' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                key={`narrative-${memorial.aiNarrative?.length || 0}`}
              >
                <NarrativeSection 
                  narrative={memorial.aiNarrative || "No narrative has been generated yet. Add memories to generate a life narrative."} 
                  memorialId={memorial.id}
                  onNarrativeUpdate={handleNarrativeUpdate}
                  memorial={memorial}
                />
                
                <div className="mt-16">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-6">Recent Memories</h2>
                  {memories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {memories.slice(0, 4).map((memory) => (
                        <MemoryCard 
                          key={memory.id} 
                          memory={memory} 
                          onUpdateMemory={handleUpdateMemory}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-neutral-50 rounded-lg">
                      <p className="text-neutral-600 mb-4">No memories have been shared yet.</p>
                      <Link to={`/memorial/${id}/add`} className="btn-warm">
                        Be the First to Add a Memory
                      </Link>
                    </div>
                  )}
                  {memories.length > 4 && (
                    <div className="text-center mt-8">
                      <button 
                        className="btn-secondary"
                        onClick={() => handleTabChange('timeline')}
                      >
                        View All Memories
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'timeline' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-2">Memory Timeline</h2>
                  <p className="text-neutral-600">
                    Explore memories chronologically from {memorial.fullName}'s life journey.
                  </p>
                </div>
                
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-neutral-700 mr-2">Filter by emotion:</span>
                  {['All', 'Joyful', 'Funny', 'Thoughtful', 'Bittersweet'].map((emotion) => (
                    <EmotionBadge key={emotion} emotion={emotion.toLowerCase()} />
                  ))}
                </div>
                
                {memories.length > 0 ? (
                  <MemoryTimeline memories={memories} />
                ) : (
                  <div className="text-center py-10 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-600 mb-4">No memories have been shared yet.</p>
                    <Link to={`/memorial/${id}/add`} className="btn-warm">
                      Be the First to Add a Memory
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-2">Photo Gallery</h2>
                  <p className="text-neutral-600">
                    A collection of photos celebrating {memorial.fullName}'s life.
                  </p>
                </div>
                
                {memories.filter(memory => memory.mediaUrl).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {memories
                      .filter(memory => memory.mediaUrl)
                      .map((memory) => (
                        <div key={memory.id} className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                          <img 
                            src={memory.mediaUrl} 
                            alt={`Memory from ${memory.contributorName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-600 mb-4">No photos have been added yet.</p>
                    <Link to={`/memorial/${id}/add`} className="btn-warm mt-4 inline-flex items-center gap-2">
                      <PenSquare size={18} /> Add Memory with Photo
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'shares' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-2">Share Memorial</h2>
                  <p className="text-neutral-600">
                    Control who can view and contribute to {memorial.fullName}'s memorial.
                  </p>
                </div>
                
                <div className="max-w-xl mx-auto">
                  <ShareOptions 
                    memorialId={memorial.id}
                    memorialName={memorial.fullName}
                    privacy={memorial.privacy}
                    isCreator={!!isCreator}
                    onPrivacyChange={handlePrivacyChange}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MemorialPage;