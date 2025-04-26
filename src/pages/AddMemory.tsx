import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import MemoryForm from '../components/memorial/MemoryForm';
import { getMemorial, addMemory } from '../lib/memorials';
import { Memory } from '../types';

const AddMemory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memorial, setMemorial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchMemorial(id);
    }
  }, [id]);
  
  const fetchMemorial = async (memorialId: string) => {
    setIsLoading(true);
    try {
      const result = await getMemorial(memorialId);
      if (result.success) {
        setMemorial(result.memorial);
      } else {
        toast({
          title: "Failed to load memorial",
          description: result.error || "The memorial could not be found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching memorial:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading the memorial.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreview = (data: any) => {
    setPreviewData(data);
    setShowPreview(true);
  };
  
  const handleSubmit = async (data: Partial<Memory>) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const result = await addMemory({
        ...data,
        memorialId: id
      });
      
      if (result.success) {
        toast({
          title: "Memory Added",
          description: "Your memory has been added to the memorial.",
          variant: "success",
        });
        navigate(`/memorial/${id}`);
      } else {
        toast({
          title: "Failed to Add Memory",
          description: result.error || "There was a problem adding your memory.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding memory:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
  
  if (!memorial) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-serif text-memorial-800 mb-4">Memorial Not Found</h1>
          <p className="text-neutral-600 mb-6">
            The memorial you're trying to add a memory to might have been removed or you don't have permission to access it.
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
  
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-memorial-800 mb-4">
              Add a Memory for {memorial.fullName}
            </h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Share your personal memory to help build a complete picture of {memorial.fullName}'s life.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Form Section */}
              <div className={`p-6 md:p-8 ${showPreview ? 'md:w-1/2' : 'w-full'}`}>
                <MemoryForm 
                  memorialId={memorial.id} 
                  memorialName={memorial.fullName} 
                  onPreview={handlePreview}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
              
              {/* Preview Section */}
              {showPreview && previewData && (
                <div className="md:w-1/2 bg-neutral-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-neutral-200">
                  <div className="mb-4">
                    <h3 className="font-serif text-xl text-memorial-800 mb-2">Memory Preview</h3>
                    <p className="text-neutral-600 text-sm">
                      See how your memory will be integrated into {memorial.fullName}'s narrative.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                    <div className="mb-3">
                      <span className="text-sm font-medium text-memorial-700">From a {previewData.relationship || 'loved one'}</span>
                      {previewData.timePeriod && (
                        <span className="text-sm text-neutral-500 ml-2">• {previewData.timePeriod}</span>
                      )}
                    </div>
                    
                    <p className="text-neutral-800 italic">{previewData.content}</p>
                    
                    {previewData.emotion && (
                      <div className="mt-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full bg-neutral-100 ${
                          previewData.emotion === 'joyful' ? 'text-green-600' :
                          previewData.emotion === 'funny' ? 'text-amber-600' :
                          previewData.emotion === 'thoughtful' ? 'text-blue-600' :
                          previewData.emotion === 'bittersweet' ? 'text-purple-600' :
                          previewData.emotion === 'sad' ? 'text-neutral-600' : ''
                        }`}>
                          {previewData.emotion.charAt(0).toUpperCase() + previewData.emotion.slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {previewData.mediaFile && (
                      <div className="mt-4 rounded-md overflow-hidden">
                        <img 
                          src={URL.createObjectURL(previewData.mediaFile)} 
                          alt="Memory" 
                          className="w-full h-auto max-h-52 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddMemory;