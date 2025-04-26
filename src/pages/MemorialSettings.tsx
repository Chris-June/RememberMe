import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Users, Lock, CheckCircle, Trash2, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { getMemorial, updateMemorial, deleteMemorial } from '../lib/memorials';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/storage';
import { useAuthStore } from '../store/authStore';
import { Memorial } from '../types';
import ShareOptions from '../components/memorial/ShareOptions';

type PrivacyOption = 'public' | 'family' | 'private';

const PrivacyOptions = [
  { 
    id: 'public', 
    label: 'Public', 
    description: 'Anyone with the link can view the memorial',
    icon: <Users className="h-5 w-5 text-memorial-600" />
  },
  { 
    id: 'family', 
    label: 'Family Only', 
    description: 'Only invited family and friends can view',
    icon: <CheckCircle className="h-5 w-5 text-memorial-600" />
  },
  { 
    id: 'private', 
    label: 'Private', 
    description: 'Only you can view and manage the memorial',
    icon: <Lock className="h-5 w-5 text-memorial-600" />
  }
];

const ToneOptions = [
  { id: 'warm', label: 'Warm', description: 'Friendly and intimate tone' },
  { id: 'reflective', label: 'Reflective', description: 'Thoughtful and contemplative tone' },
  { id: 'humorous', label: 'Humorous', description: 'Light-hearted with touches of humor' },
  { id: 'respectful', label: 'Respectful', description: 'Dignified and reverent tone' }
];

const StyleOptions = [
  { id: 'conversational', label: 'Conversational', description: 'Casual, everyday language' },
  { id: 'poetic', label: 'Poetic', description: 'Artistic with figurative language' },
  { id: 'storytelling', label: 'Storytelling', description: 'Narrative with story elements' },
  { id: 'formal', label: 'Formal', description: 'More structured and traditional' }
];

const MemorialSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    passedDate: '',
    description: '',
    privacy: 'family' as PrivacyOption,
    tone: 'warm',
    style: 'conversational'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fetchMemorial = async (memorialId: string) => {
    setIsLoading(true);
    try {
      const result = await getMemorial(memorialId);
      if (result.success && result.memorial) {
        const memorialData = result.memorial;
        setMemorial(memorialData);
        
        // Check if current user is the creator
        if (user && memorialData.user_id === user.id) {
          setIsCreator(true);
        } else {
          // If not the creator, redirect to memorial view
          toast({
            title: "Unauthorized",
            description: "Only the memorial creator can access settings.",
            variant: "destructive",
          });
          navigate(`/memorial/${memorialId}`);
          return;
        }
        
        // Initialize form data
        setFormData({
          fullName: memorialData.fullName || '',
          birthDate: memorialData.birthDate || '',
          passedDate: memorialData.passedDate || '',
          description: memorialData.description || '',
          privacy: (memorialData.privacy as PrivacyOption) || 'family',
          tone: memorialData.tone || 'warm',
          style: memorialData.style || 'conversational'
        });
      } else {
        toast({
          title: "Failed to load memorial",
          description: result.error || "The memorial could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error fetching memorial:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading the memorial.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchMemorial(id);
    }
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handlePrivacyChange = async (privacy: PrivacyOption) => {
    if (!id || !isCreator) return;
    
    setIsSaving(true);
    
    try {
      // Update privacy setting
      const result = await updateMemorial(id, { privacy });
      
      if (result.success) {
        setFormData(prev => ({ ...prev, privacy }));
        
        if (memorial) {
          setMemorial({
            ...memorial,
            privacy
          });
        }
        
        toast({
          title: "Privacy Updated",
          description: `Memorial is now ${privacy === 'public' ? 'public' : privacy === 'family' ? 'family only' : 'private'}.`,
          variant: "success",
        });
      } else {
        throw new Error(result.error || "Failed to update privacy setting");
      }
    } catch (error: any) {
      console.error("Error updating privacy:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToneChange = (tone: string) => {
    setFormData(prev => ({ ...prev, tone }));
  };

  const handleStyleChange = (style: string) => {
    setFormData(prev => ({ ...prev, style }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !isCreator) return;
    
    setIsSaving(true);
    
    try {
      // Handle file upload if there's a selected file
      let coverImage = memorial?.coverImage;
      
      if (selectedFile) {
        // Try to upload to Supabase storage
        const uploadResult = await uploadFile('memorial-covers', selectedFile, user.id);
        
        if (uploadResult.success && uploadResult.url) {
          coverImage = uploadResult.url;
          
          if (uploadResult.error) {
            // This means we're using a fallback (object URL)
            toast({
              title: "Image Storage Notice",
              description: uploadResult.error,
              variant: "warning",
            });
          } else {
            toast({
              title: "Image Uploaded",
              description: "Cover image successfully uploaded.",
              variant: "success",
            });
          }
        } else {
          toast({
            title: "Image Upload Issue",
            description: uploadResult.error || "Could not process the image. Other changes will still be saved.",
            variant: "warning",
          });
        }
      }
      
      // Update memorial
      const result = await updateMemorial(id, {
        ...formData,
        coverImage
      });
      
      if (result.success) {
        toast({
          title: "Changes Saved",
          description: "Your memorial settings have been updated successfully.",
          variant: "success",
        });
        setMemorial(result.memorial);
      } else {
        toast({
          title: "Failed to Save Changes",
          description: result.error || "There was a problem updating your memorial.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating memorial:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id || !isCreator) return;
    
    if (!window.confirm("Are you sure you want to delete this memorial? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const result = await deleteMemorial(id);
      
      if (result.success) {
        toast({
          title: "Memorial Deleted",
          description: "The memorial has been permanently deleted.",
          variant: "success",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Failed to Delete Memorial",
          description: result.error || "There was a problem deleting the memorial.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting memorial:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-memorial-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading memorial settings...</p>
        </div>
      </div>
    );
  }
  
  if (!memorial) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-serif text-memorial-800 mb-4">Memorial Not Found</h1>
          <p className="text-neutral-600 mb-6">
            The memorial you're trying to edit might have been removed or you don't have permission to access it.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!isCreator) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-serif text-memorial-800 mb-4">Unauthorized Access</h1>
          <p className="text-neutral-600 mb-6">
            Only the memorial creator can access and modify settings.
          </p>
          <button 
            onClick={() => navigate(`/memorial/${id}`)}
            className="btn-primary"
          >
            View Memorial
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-memorial-800 mb-2">Memorial Settings</h1>
            <p className="text-neutral-600">
              Update information and preferences for {memorial.fullName}'s memorial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h2 className="text-xl font-serif text-memorial-700 mb-4">Basic Information</h2>
                      
                      <div className="mb-4">
                        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                          Full Name*
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="birthDate" className="block text-sm font-medium text-neutral-700 mb-1">
                            Birth Date
                          </label>
                          <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="passedDate" className="block text-sm font-medium text-neutral-700 mb-1">
                            Date of Passing
                          </label>
                          <input
                            type="date"
                            id="passedDate"
                            name="passedDate"
                            value={formData.passedDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
                          placeholder="Share a brief description about your loved one..."
                        ></textarea>
                      </div>
                    </div>
                    
                    {/* Cover Photo */}
                    <div>
                      <h2 className="text-xl font-serif text-memorial-700 mb-4">Cover Photo</h2>
                      
                      <div className="mb-4">
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-100 mb-3">
                          <img 
                            src={memorial.coverImage || 'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg'} 
                            alt="Memorial cover" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-memorial-400 transition-colors">
                          <input
                            type="file"
                            id="coverPhoto"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <label htmlFor="coverPhoto" className="cursor-pointer block">
                            <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                            <p className="text-neutral-600 mb-1">
                              {selectedFile ? selectedFile.name : "Click to upload a new cover photo"}
                            </p>
                            <p className="text-neutral-500 text-sm">
                              JPG, PNG or GIF (max. 5MB)
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Narrative Voice */}
                    <div>
                      <h2 className="text-xl font-serif text-memorial-700 mb-4">Narrative Voice</h2>
                      <p className="text-neutral-600 mb-4">
                        Choose the tone and style that best reflects your loved one's personality for the AI-generated narrative.
                      </p>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-neutral-700 mb-3">Tone</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                          {ToneOptions.map((option) => (
                            <div 
                              key={option.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                formData.tone === option.id 
                                  ? 'border-memorial-500 bg-memorial-50' 
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                              onClick={() => handleToneChange(option.id)}
                            >
                              <h4 className="font-medium">{option.label}</h4>
                              <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <h3 className="text-lg font-medium text-neutral-700 mb-3">Writing Style</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                          {StyleOptions.map((option) => (
                            <div 
                              key={option.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                formData.style === option.id 
                                  ? 'border-memorial-500 bg-memorial-50' 
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                              onClick={() => handleStyleChange(option.id)}
                            >
                              <h4 className="font-medium">{option.label}</h4>
                              <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">
                        Changing these settings will affect how the next generated narrative sounds. You'll need to regenerate the narrative to see the changes.
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`py-2.5 px-4 rounded-md font-medium text-white transition-colors ${
                          isDeleting 
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isDeleting ? (
                          <span className="flex items-center justify-center">
                            <Loader size={16} className="animate-spin mr-2" />
                            Deleting...
                          </span>
                        ) : 'Delete Memorial'}
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isSaving}
                        className={`py-2.5 px-8 sm:px-12 rounded-md font-medium text-white transition-colors ${
                          isSaving 
                            ? 'bg-memorial-400 cursor-not-allowed'
                            : 'bg-memorial-600 hover:bg-memorial-700'
                        }`}
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center">
                            <Loader size={16} className="animate-spin mr-2" />
                            Saving...
                          </span>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="md:col-span-1">
              {/* Share Options Component */}
              <ShareOptions 
                memorialId={memorial.id}
                memorialName={memorial.fullName}
                privacy={memorial.privacy}
                isCreator={isCreator}
                onPrivacyChange={handlePrivacyChange}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MemorialSettings;