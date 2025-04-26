import { useState } from 'react';
import { Link as LinkIcon, Copy, CheckCircle, Users, Lock, Share2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import InviteModal from './InviteModal';

interface ShareOptionsProps {
  memorialId: string;
  memorialName: string;
  privacy: string;
  isCreator: boolean;
  onPrivacyChange?: (privacy: string) => Promise<void>;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({
  memorialId,
  memorialName,
  privacy,
  isCreator,
  onPrivacyChange
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/memorial/${memorialId}`;
    navigator.clipboard.writeText(url);
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    toast({
      title: "Link Copied",
      description: "Memorial link has been copied to clipboard",
      variant: "success",
    });
  };

  const handlePrivacyChange = async (newPrivacy: string) => {
    if (!isCreator || !onPrivacyChange) return;
    
    await onPrivacyChange(newPrivacy);
  };

  const handleOpenInviteModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="font-serif text-xl text-memorial-800 mb-6 flex items-center">
          <Share2 className="mr-2 h-5 w-5 text-memorial-600" />
          Share Options
        </h3>
        
        {isCreator && (
          <div className="mb-6">
            <h4 className="text-neutral-700 font-medium mb-3">Privacy Setting</h4>
            <div className="grid grid-cols-3 gap-2">
              <button 
                className={`py-2 px-4 rounded border border-neutral-200 flex flex-col items-center justify-center transition-colors ${
                  privacy === 'public' 
                    ? 'border-memorial-500 bg-memorial-50 text-memorial-700' 
                    : 'text-neutral-600 hover:border-neutral-300'
                }`}
                onClick={() => handlePrivacyChange('public')}
              >
                <span>Public</span>
              </button>
              
              <button 
                className={`py-2 px-4 rounded border border-neutral-200 flex flex-col items-center justify-center transition-colors ${
                  privacy === 'family' 
                    ? 'border-memorial-500 bg-memorial-50 text-memorial-700' 
                    : 'text-neutral-600 hover:border-neutral-300'
                }`}
                onClick={() => handlePrivacyChange('family')}
              >
                <span>Family<br/>Only</span>
              </button>
              
              <button 
                className={`py-2 px-4 rounded border border-neutral-200 flex flex-col items-center justify-center transition-colors ${
                  privacy === 'private' 
                    ? 'border-memorial-500 bg-memorial-50 text-memorial-700' 
                    : 'text-neutral-600 hover:border-neutral-300'
                }`}
                onClick={() => handlePrivacyChange('private')}
              >
                <span>Private</span>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {privacy === 'public' 
                ? 'Anyone with the link can view this memorial.' 
                : privacy === 'family' 
                  ? 'Only invited family members and friends can view this memorial.' 
                  : 'Only you can view this memorial.'}
            </p>
          </div>
        )}
        
        <div>
          <h4 className="text-neutral-700 font-medium mb-3">Share Memorial</h4>
          <div className="space-y-3">
            <button 
              className="flex items-center w-full justify-center p-3 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700"
              onClick={handleCopyLink}
            >
              {isCopied ? (
                <>
                  <CheckCircle size={16} className="mr-2 text-green-500" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            
            {isCreator && privacy !== 'public' && (
              <button 
                className="flex items-center w-full justify-center p-3 rounded bg-memorial-100 hover:bg-memorial-200 transition-colors text-memorial-700"
                onClick={handleOpenInviteModal}
              >
                <LinkIcon size={16} className="mr-2" />
                <span>Create Invite Link</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <InviteModal 
          memorialId={memorialId} 
          memorialName={memorialName} 
          onClose={handleCloseInviteModal} 
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default ShareOptions;