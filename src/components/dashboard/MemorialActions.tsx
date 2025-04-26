import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Settings, MoreHorizontal, Trash2, Share2, Lock, Eye } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../store/authStore';
import { Memorial } from '../../types';

interface MemorialActionsProps {
  memorial: Memorial;
  onDelete: (id: string) => Promise<void>;
}

const MemorialActions: React.FC<MemorialActionsProps> = ({ memorial, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Check if the current user is the creator of the memorial
  const isCreator = user && memorial.user_id === user.id;
  
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  const closeMenu = () => {
    setShowMenu(false);
  };
  
  const handleShare = () => {
    // Copy memorial link to clipboard
    const memorialUrl = `${window.location.origin}/memorial/${memorial.id}`;
    navigator.clipboard.writeText(memorialUrl);
    
    toast({
      title: "Link Copied",
      description: "Memorial link has been copied to clipboard.",
      variant: "success",
    });
    
    closeMenu();
  };
  
  const handleDelete = () => {
    // Only creators can delete memorials
    if (!isCreator) {
      toast({
        title: "Unauthorized",
        description: "Only the memorial creator can delete a memorial.",
        variant: "destructive",
      });
      closeMenu();
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this memorial? This action cannot be undone.")) {
      onDelete(memorial.id);
    }
    
    closeMenu();
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Link 
        to={`/memorial/${memorial.id}/add`}
        className="p-2 text-neutral-500 hover:text-memorial-600 hover:bg-neutral-100 rounded-full transition-colors"
        title="Add Memory"
      >
        <Edit size={18} />
      </Link>
      
      {/* Only show settings to the creator */}
      {isCreator && (
        <Link 
          to={`/memorial/${memorial.id}/settings`}
          className="p-2 text-neutral-500 hover:text-memorial-600 hover:bg-neutral-100 rounded-full transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </Link>
      )}
      
      <div className="relative">
        <button 
          className="p-2 text-neutral-500 hover:text-memorial-600 hover:bg-neutral-100 rounded-full transition-colors"
          title="More Options"
          onClick={toggleMenu}
        >
          <MoreHorizontal size={18} />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={closeMenu}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
              <button 
                className="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={handleShare}
              >
                <Share2 size={16} className="mr-2" />
                Share Memorial
              </button>
              <Link 
                to={`/memorial/${memorial.id}`} 
                className="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={closeMenu}
              >
                <Eye size={16} className="mr-2" />
                View Memorial
              </Link>
              
              {/* Only show privacy option to creator */}
              {isCreator && (
                <Link
                  to={`/memorial/${memorial.id}/settings`}
                  className="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  onClick={closeMenu}
                >
                  <Lock size={16} className="mr-2" />
                  Change Privacy
                </Link>
              )}
              
              {/* Only show delete option to creator */}
              {isCreator && (
                <button 
                  className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-neutral-50 transition-colors"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Memorial
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemorialActions;