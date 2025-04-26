import { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface CommentFormProps {
  memoryId: string;
  onCommentSubmit: (comment: { content: string }) => Promise<void>;
  isSubmitting: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  memoryId, 
  onCommentSubmit, 
  isSubmitting 
}) => {
  const [comment, setComment] = useState('');
  const { user } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || isSubmitting) return;
    
    await onCommentSubmit({ content: comment });
    setComment('');
  };
  
  if (!user) {
    return (
      <div className="mt-4 text-center border-t border-neutral-200 pt-4">
        <p className="text-sm text-neutral-600">
          Please <a href="/sign-in" className="text-memorial-600 hover:text-memorial-700">sign in</a> to leave a comment.
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-neutral-200 pt-4">
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-neutral-100 flex-shrink-0 overflow-hidden">
          {/* User avatar could go here */}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className={`px-4 py-1.5 rounded-md font-medium text-white text-sm flex items-center gap-1.5 transition-colors ${
                isSubmitting || !comment.trim()
                  ? 'bg-memorial-400 cursor-not-allowed'
                  : 'bg-memorial-600 hover:bg-memorial-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;