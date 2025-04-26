import React, { useState } from 'react';
import { format } from 'date-fns';
import { Heart, MessageSquare, ChevronDown, ChevronUp, X, Loader } from 'lucide-react';
import { Memory, Comment } from '../../types';
import { useAuthStore } from '../../store/authStore';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { addComment, deleteComment, toggleMemoryLike } from '../../lib/memorials';
import { useToast } from '../../hooks/useToast';

interface MemoryCardProps {
  memory: Memory;
  onUpdateMemory?: (updatedMemory: Memory) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onUpdateMemory }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(memory.comments || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [likeCount, setLikeCount] = useState(memory.likes || 0);
  const [hasLiked, setHasLiked] = useState(memory.hasLiked || false);
  
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const handleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await toggleMemoryLike(memory.id);
      if (result.success) {
        // Update local state
        const newLikeStatus = !hasLiked;
        setHasLiked(newLikeStatus);
        setLikeCount(prev => newLikeStatus ? prev + 1 : Math.max(prev - 1, 0));
        
        // Update the parent component if callback is provided
        if (onUpdateMemory) {
          onUpdateMemory({
            ...memory,
            likes: newLikeStatus ? (memory.likes || 0) + 1 : Math.max((memory.likes || 0) - 1, 0),
            hasLiked: newLikeStatus
          });
        }
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "Could not process your request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleAddComment = async (commentData: { content: string }) => {
    if (!user || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      const result = await addComment({
        memoryId: memory.id,
        content: commentData.content
      });
      
      if (result.success && result.comment) {
        // Add the new comment to the list
        const newComments = [...comments, result.comment];
        setComments(newComments);
        
        // Update the parent component if callback is provided
        if (onUpdateMemory) {
          onUpdateMemory({
            ...memory,
            comments: newComments
          });
        }
        
        toast({
          title: "Comment Added",
          description: "Your comment has been posted successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to Add Comment",
          description: result.error || "There was a problem posting your comment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!user || isDeletingComment) return;
    
    setIsDeletingComment(true);
    try {
      const result = await deleteComment(commentId);
      
      if (result.success) {
        // Remove the deleted comment from the list
        const updatedComments = comments.filter(comment => comment.id !== commentId);
        setComments(updatedComments);
        
        // Update the parent component if callback is provided
        if (onUpdateMemory) {
          onUpdateMemory({
            ...memory,
            comments: updatedComments
          });
        }
        
        toast({
          title: "Comment Deleted",
          description: "Your comment has been removed.",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to Delete Comment",
          description: result.error || "There was a problem deleting your comment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeletingComment(false);
    }
  };
  
  return (
    <div className="memory-card">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden mr-3">
          {memory.contributorAvatar && (
            <img 
              src={memory.contributorAvatar} 
              alt={memory.contributorName || "Contributor"} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <p className="font-medium text-memorial-800">{memory.contributorName || "Anonymous"}</p>
          <p className="text-sm text-neutral-500">
            {memory.relationship && `${memory.relationship} • `}
            {memory.date && format(new Date(memory.date), 'MMM d, yyyy')}
            {!memory.date && memory.timePeriod && memory.timePeriod}
          </p>
        </div>
      </div>
      
      {memory.mediaUrl && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img 
            src={memory.mediaUrl} 
            alt="Memory" 
            className="w-full object-cover max-h-60"
          />
        </div>
      )}
      
      <p className="text-neutral-800 mb-4">{memory.content}</p>
      
      <div className="flex items-center justify-between">
        {memory.emotion && (
          <span 
            className={`inline-block px-2 py-1 text-xs rounded-full bg-neutral-100 ${
              memory.emotion === 'joyful' ? 'text-green-600' :
              memory.emotion === 'funny' ? 'text-amber-600' :
              memory.emotion === 'thoughtful' ? 'text-blue-600' :
              memory.emotion === 'bittersweet' ? 'text-purple-600' :
              memory.emotion === 'sad' ? 'text-neutral-600' : ''
            }`}
          >
            {memory.emotion.charAt(0).toUpperCase() + memory.emotion.slice(1)}
          </span>
        )}
        
        <div className="flex items-center space-x-4">
          <button 
            className={`flex items-center ${
              hasLiked 
                ? 'text-warm-500' 
                : 'text-neutral-500 hover:text-warm-500'
            } transition-colors`}
            onClick={handleLike}
            disabled={isLiking || !user}
          >
            {isLiking ? (
              <Loader size={16} className="animate-spin mr-1" />
            ) : (
              <Heart 
                size={16} 
                className={`mr-1 ${hasLiked ? 'fill-warm-500' : ''}`} 
              />
            )}
            <span className="text-sm">{likeCount}</span>
          </button>
          
          <button 
            className="flex items-center text-neutral-500 hover:text-memorial-500 transition-colors"
            onClick={toggleComments}
          >
            <MessageSquare size={16} className="mr-1" />
            <span className="text-sm">{comments.length}</span>
            {showComments ? (
              <ChevronUp size={16} className="ml-1" />
            ) : (
              <ChevronDown size={16} className="ml-1" />
            )}
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="mt-4">
          <CommentList 
            comments={comments} 
            onDeleteComment={handleDeleteComment}
            isDeleting={isDeletingComment}
          />
          <CommentForm 
            memoryId={memory.id} 
            onCommentSubmit={handleAddComment}
            isSubmitting={isSubmittingComment}
          />
        </div>
      )}
    </div>
  );
};

export default MemoryCard;