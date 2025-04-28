import { useState, useEffect } from 'react';
import { Calendar, Upload, RefreshCw, Loader, User } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../../hooks/useToast';
import EmotionSelector from './EmotionSelector';
import { setMemoryMediaFile } from '../../lib/memorials';
import { useAuthStore } from '../../store/authStore';
import { uploadFile } from '../../lib/storage';
import type { Emotion, MemoryFormData, CreateMemoryPayload } from '../../types/memorial';

interface MemoryFormProps {
  memorialId: string;
  memorialName: string;
  onSubmit?: (memory: CreateMemoryPayload) => void;
  onPreview?: (memory: MemoryFormData) => void;
  initialData?: Partial<MemoryFormData>;
  isSubmitting?: boolean;
}

const MemoryForm: React.FC<MemoryFormProps> = ({ 
  memorialId, 
  memorialName, 
  onSubmit, 
  onPreview,
  initialData = {},
  isSubmitting = false
}) => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<MemoryFormData>({
    content: initialData.content || '',
    relationship: initialData.relationship || '',
    timePeriod: initialData.timePeriod || '',
    emotion: initialData.emotion as Emotion || '',
    contributorName: initialData.contributorName || '',
    mediaFile: null,
    mediaPreview: null,
  });
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  useEffect(() => {
    // Auto-populate the contributor's name if it's available from user profile
    if (user && user.username && !formData.contributorName) {
      setFormData(prev => ({
        ...prev,
        contributorName: user.username || ''
      }));
    }
  }, [user]);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors?.[0];
      if (error?.code === 'file-too-large') {
        toast({
          title: "File Too Large",
          description: "The selected file exceeds the 5MB limit.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file (JPG, PNG, GIF).",
          variant: "destructive",
        });
      }
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleEmotionSelect = (emotion: Emotion) => {
    setFormData((prev) => ({ ...prev, emotion }));
  };
  
  const generatePreview = () => {
    if (!formData.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please share your memory before generating a preview.",
        variant: "destructive",
      });
      return;
    }
    
    if (onPreview) {
      onPreview({ ...formData, mediaFile, mediaPreview });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please share your memory before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.relationship) {
      toast({
        title: "Relationship Required",
        description: "Please select your relationship to the person.",
        variant: "destructive",
      });
      return;
    }
    
    let mediaUrl = null;
    
    // Handle media file upload if present
    if (mediaFile && user) {
      const uploadResult = await uploadFile('memory-media', mediaFile, user.id);
      
      if (uploadResult.success && uploadResult.url) {
        mediaUrl = uploadResult.url;
        
        if (uploadResult.error) {
          // This is using a fallback (object URL)
          toast({
            title: "Image Storage Notice",
            description: uploadResult.error,
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Image Upload Issue",
          description: uploadResult.error || "Could not upload the image, but your memory will still be saved.",
          variant: "default",
        });
      }
    }
    
    // Set the media file in the global helper for upload
    setMemoryMediaFile(mediaFile);
    
    // Prepare data for submission
    const memoryData: CreateMemoryPayload = {
      ...formData,
      memorialId,
      mediaUrl
    };
    
    // Submit the data
    if (onSubmit) {
      onSubmit(memoryData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Memory Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">
            Your Memory*
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
            placeholder={`Share a specific memory or story about ${memorialName}...`}
            required
          ></textarea>
        </div>
        
        {/* Contributor Name */}
        <div>
          <label htmlFor="contributorName" className="block text-sm font-medium text-neutral-700 mb-1">
            Your Name*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              <User size={18} />
            </div>
            <input
              type="text"
              id="contributorName"
              name="contributorName"
              value={formData.contributorName}
              onChange={handleChange}
              className="w-full pl-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
              placeholder="Your full name"
              required
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">This name will be displayed with your memory</p>
        </div>
        
        {/* Relationship & Time Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-neutral-700 mb-1">
              Your Relationship*
            </label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
            >
              <option value="">Select relationship</option>
              <option value="Aunt">Aunt</option>
              <option value="Child">Child</option>
              <option value="Colleague">Colleague</option>
              <option value="Cousin">Cousin</option>
              <option value="Ex-Spouse">Ex-Spouse</option>
              <option value="Family Friend">Family Friend</option>
              <option value="Friend">Friend</option>
              <option value="Godchild">Godchild</option>
              <option value="Godparent">Godparent</option>
              <option value="Grandchild">Grandchild</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Half-Sibling">Half-Sibling</option>
              <option value="In-Law">In-Law</option>
              <option value="Mentor">Mentor</option>
              <option value="Neighbor">Neighbor</option>
              <option value="Niece">Niece</option>
              <option value="Nephew">Nephew</option>
              <option value="Other">Other</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Spouse">Spouse/Partner</option>
              <option value="Stepchild">Stepchild</option>
              <option value="Stepparent">Stepparent</option>
              <option value="Step-Sibling">Step-Sibling</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Uncle">Uncle</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timePeriod" className="block text-sm font-medium text-neutral-700 mb-1">
              Time Period <span className="text-neutral-500 text-xs">(Approximate)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="timePeriod"
                name="timePeriod"
                value={formData.timePeriod}
                onChange={handleChange}
                className="w-full px-3 py-2 pl-9 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
                placeholder="e.g. Summer 1998, Early 2000s"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
            </div>
          </div>
        </div>
        
        {/* Emotional Context */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Emotional Context
          </label>
          <EmotionSelector 
            selectedEmotion={formData.emotion} 
            onSelect={handleEmotionSelect} 
          />
        </div>
        
        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Add a Photo <span className="text-neutral-500 text-xs">(Optional)</span>
          </label>
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-memorial-400 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            {mediaPreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="h-32 object-contain mb-2"
                />
                <p className="text-sm text-neutral-600">{mediaFile?.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <p className="text-neutral-600 text-sm">
                  Drag a photo here or click to upload
                </p>
                <p className="text-neutral-500 text-xs mt-1">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={generatePreview}
            className="flex-1 py-2.5 rounded-md font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2"
          >
            <RefreshCw size={18} /> Generate Preview
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-md font-medium text-white transition-colors ${
              isSubmitting 
                ? 'bg-memorial-400 cursor-not-allowed'
                : 'bg-memorial-600 hover:bg-memorial-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader size={20} className="animate-spin mr-2" />
                Adding Memory...
              </span>
            ) : 'Add Memory'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MemoryForm;