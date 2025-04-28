import { useState } from 'react';
import { Copy, CheckCircle, Loader, Mail } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { generateInviteCode } from '../../lib/invites';

interface InviteModalProps {
  memorialId: string;
  memorialName: string;
  onClose: () => void;
  isOpen: boolean;
}

const InviteModal: React.FC<InviteModalProps> = ({ 
  memorialId, 
  memorialName, 
  onClose,
  isOpen 
}) => {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const result = await generateInviteCode(memorialId);
      
      if (result.success && result.code) {
        setInviteCode(result.code);
      } else {
        toast({
          title: "Error",
          description: result.error || "Could not generate invite code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating invite:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteCode) return;
    
    const inviteLink = `${window.location.origin}/memorial/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    toast({
      title: "Link Copied",
      description: "Invite link has been copied to clipboard",
      variant: "success",
    });
  };

  const handleEmailShare = () => {
    if (!inviteCode) return;
    
    const inviteLink = `${window.location.origin}/memorial/join/${inviteCode}`;
    const subject = `Join the memorial for ${memorialName}`;
    const body = `I'd like to invite you to join the memorial for ${memorialName}. Click this link to access: ${inviteLink}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif font-semibold text-memorial-800">Invite to Memorial</h3>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              &times;
            </button>
          </div>
          
          <p className="text-neutral-600 mb-6">
            Generate an invite link to share access to {memorialName}'s memorial with family and friends.
          </p>
          
          {!inviteCode ? (
            <button
              onClick={handleGenerateInvite}
              disabled={isGenerating}
              className={`w-full py-2.5 rounded-md font-medium text-white transition-colors ${
                isGenerating 
                  ? 'bg-memorial-400 cursor-not-allowed'
                  : 'bg-memorial-600 hover:bg-memorial-700'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <Loader size={20} className="animate-spin mr-2" />
                  Generating invite...
                </span>
              ) : 'Generate Invite Link'}
            </button>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <div className="flex-1 bg-neutral-100 p-3 rounded-l-md text-neutral-800 break-all overflow-hidden text-sm">
                  {`${window.location.origin}/memorial/join/${inviteCode}`}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-memorial-100 text-memorial-700 p-3 rounded-r-md hover:bg-memorial-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {isCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center py-2 rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <Copy size={18} className="mr-2" />
                  Copy Link
                </button>
                
                <button
                  onClick={handleEmailShare}
                  className="flex items-center justify-center py-2 rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <Mail size={18} className="mr-2" />
                  Email
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleGenerateInvite}
                  className="text-memorial-600 hover:text-memorial-700 text-sm"
                >
                  Generate New Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;