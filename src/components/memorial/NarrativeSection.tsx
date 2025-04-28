import React, { useState, useEffect } from 'react';
import type { Memorial } from '../../types';
import { motion } from 'framer-motion';
import { RefreshCw, ThumbsUp, Loader, Clock } from 'lucide-react';
import { generateNarrative } from '../../lib/ai';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../store/authStore';

interface NarrativeSectionProps {
  narrative: string;
  memorialId: string;
  onNarrativeUpdate?: (newNarrative: string) => void;
  memorial?: Memorial;
}

const NarrativeSection: React.FC<NarrativeSectionProps> = ({ 
  narrative, 
  memorialId,
  onNarrativeUpdate,
  memorial
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentNarrative, setCurrentNarrative] = useState(narrative);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Update currentNarrative when the prop changes
  useEffect(() => {
    console.log("Narrative prop changed in NarrativeSection, length:", narrative?.length || 0);
    console.log("First 50 chars:", narrative?.substring(0, 50));
    setCurrentNarrative(narrative);
  }, [narrative]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);
  
  // Check if current user is memorial creator
  const isCreator = user && memorial && memorial.user_id === user.id;
  
  // Split the narrative into paragraphs, handling cases where there are no paragraph breaks
  const getParagraphs = () => {
    if (!currentNarrative || currentNarrative.trim() === '') {
      return ["No narrative has been generated yet."];
    }
    
    const paragraphs = currentNarrative.split(/\n\n+/);
    
    // If there are no paragraph breaks, create artificial paragraphs
    if (paragraphs.length <= 1 && currentNarrative.length > 200) {
      // Try to break it up into 3-4 paragraphs
      const avgParagraphLength = Math.floor(currentNarrative.length / 3);
      const sentences = currentNarrative.match(/[^.!?]+[.!?]+/g) || [currentNarrative];
      
      const newParagraphs = [];
      let currentParagraph = "";
      
      for (const sentence of sentences) {
        if (currentParagraph.length + sentence.length > avgParagraphLength && currentParagraph.length > 0) {
          newParagraphs.push(currentParagraph.trim());
          currentParagraph = "";
        }
        currentParagraph += sentence;
      }
      
      if (currentParagraph.length > 0) {
        newParagraphs.push(currentParagraph.trim());
      }
      
      return newParagraphs;
    }
    
    return paragraphs;
  };
  
  const paragraphs = getParagraphs();

  const handleRegenerate = async () => {
    if (isGenerating) return;
    
    // Only memorial creator can regenerate the narrative
    if (!isCreator) {
      toast({
        title: "Unauthorized",
        description: "Only the memorial creator can regenerate the narrative.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    console.log("Starting narrative generation for memorial:", memorialId);
    
    try {
      console.log("Calling generateNarrative function");
      const result = await generateNarrative({ memorialId });
      console.log("Generate narrative result:", result.success ? "Success" : "Failed", result.error || "");
      
      if (result.success && result.narrative) {
        console.log("Setting new narrative, length:", result.narrative.length);
        console.log("First 50 chars of new narrative:", result.narrative.substring(0, 50));
        
        // Update local state immediately
        setCurrentNarrative(result.narrative);
        
        // Notify parent component about the update
        if (onNarrativeUpdate) {
          console.log("Calling onNarrativeUpdate callback");
          onNarrativeUpdate(result.narrative);
        }
        
        toast({
          title: "Narrative Updated",
          description: "The life narrative has been regenerated based on the memories.",
          variant: "success",
        });
      } else if (result.timeRemaining && result.timeRemaining > 0) {
        // Start countdown for rate limit
        setCountdown(result.timeRemaining);
        
        // Set up interval to update countdown
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev !== null && prev > 1) {
              return prev - 1;
            } else {
              clearInterval(interval);
              return null;
            }
          });
        }, 1000);
        
        setCountdownInterval(interval);
        
        toast({
          title: "Rate Limited",
          description: result.error || "Please wait before generating another narrative.",
          variant: "destructive",
        });
      } else {
        console.error("Narrative generation failed:", result.error);
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate a new narrative. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleRegenerate:", error);
      toast({
        title: "Generation Failed",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleLikeNarrative = () => {
    setIsLiking(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Narrative Liked",
        description: "Thank you for your feedback.",
        variant: "success",
      });
      setIsLiking(false);
    }, 1000);
  };

  // Format remaining time for display
  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-memorial-800 mb-1">Life Narrative</h2>
          <p className="text-neutral-600">
            Generated from collected memories and stories.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Only show regenerate button to memorial creator */}
          {isCreator && (
            <div>
              <button 
                className={`btn-secondary flex items-center gap-2 text-sm ${isGenerating || countdown ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleRegenerate}
                disabled={isGenerating || countdown !== null}
              >
                {isGenerating ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Generating...
                  </>
                ) : countdown !== null ? (
                  <>
                    <Clock size={16} /> {formatRemainingTime(countdown)}
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Regenerate
                  </>
                )}
              </button>
              {countdown !== null && (
                <p className="text-xs text-neutral-500 mt-1 text-center">
                  Rate limited - please wait
                </p>
              )}
            </div>
          )}
          <button 
            className={`btn-warm flex items-center gap-2 text-sm ${isLiking ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleLikeNarrative}
            disabled={isLiking}
          >
            {isLiking ? (
              <>
                <Loader size={16} className="animate-spin" /> Liking...
              </>
            ) : (
              <>
                <ThumbsUp size={16} /> Like Narrative
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-neutral-200">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <motion.p 
              key={`para-${index}-${paragraph.substring(0, 10).replace(/\W/g, '')}`}
              className="text-neutral-800 mb-6 text-lg leading-relaxed last:mb-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {paragraph}
            </motion.p>
          ))
        ) : (
          <motion.p
            className="text-neutral-800 mb-6 text-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currentNarrative || "No narrative has been generated yet. Add memories to generate a life narrative."}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default NarrativeSection;