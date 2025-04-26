import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Trash } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Comment } from '../../types';

interface CommentListProps {
  comments: Comment[];
  onDeleteComment: (commentId: string) => Promise<void>;
  isDeleting: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  onDeleteComment,
  isDeleting
}) => {
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  if (!comments || comments.length === 0) {
    return null;
  }
  
  const toggleMenu = (commentId: string) => {
    setExpandedCommentId(expandedCommentId === commentId ? null : commentId);
  };
  
  const handleDelete = async (commentId: string) => {
    if (isDeleting) return;
    
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await onDeleteComment(commentId);
    }
  };
  
  return (
    <div className="mt-4 space-y-3">
      {comments.map(comment => (
        <div key={comment.id} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex-shrink-0 overflow-hidden">
            {comment.userAvatar && (
              <img 
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 bg-neutral-50 rounded-md px-3 py-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-memorial-800">{comment.userName}</span>
                <span className="text-xs text-neutral-500 ml-2">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>
              {user && user.id === comment.userId && (
                <div className="relative">
                  <button 
                    className="p-1 text-neutral-500 hover:text-neutral-700 rounded-full"
                    onClick={() => toggleMenu(comment.id)}
                    disabled={isDeleting}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  
                  {expandedCommentId === comment.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setExpandedCommentId(null)}
                      ></div>
                      <div className="absolute right-0 z-20 mt-1 bg-white rounded-md shadow-lg py-1 w-32">
                        <button 
                          className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-50"
                          onClick={() => handleDelete(comment.id)}
                          disabled={isDeleting}
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-neutral-700 mt-1">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;