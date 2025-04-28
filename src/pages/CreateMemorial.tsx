import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, Lock, Upload, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';
import { createMemorial } from '../lib/memorials';
import { uploadFile } from '../lib/storage';

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
    icon: <Heart className="h-5 w-5 text-memorial-600" />
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

const CreateMemorial = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    passedDate: '',
    relationship: '',
    description: '',
    privacy: 'family',
    tone: 'warm',
    style: 'conversational'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePrivacyChange = (privacy: string) => {
    setFormData(prev => ({ ...prev, privacy }));
  };

  const handleToneChange = (tone: string) => {
    setFormData(prev => ({ ...prev, tone }));
  };

  const handleStyleChange = (style: string) => {
    setFormData(prev => ({ ...prev, style }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a memorial.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload cover image to Supabase storage if selected
      let coverImage: string | undefined;
      
      if (selectedFile) {
        const uploadResult = await uploadFile('memorial-covers', selectedFile, user.id);
        
        if (uploadResult.success && uploadResult.url) {
          coverImage = uploadResult.url;
          
          if (uploadResult.error) {
            // This means we're using a fallback (object URL)
            toast({
              title: "Image Storage Notice",
              description: uploadResult.error,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Image Upload Issue",
            description: uploadResult.error || "Could not upload image. Memorial will be created without a cover image.",
            variant: "destructive",
          });
        }
      }
      
      // Create memorial with uploaded image URL
      const result = await createMemorial({
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        passedDate: formData.passedDate,
        description: formData.description,
        privacy: formData.privacy as 'public' | 'family' | 'private',
        tone: formData.tone,
        style: formData.style,
        coverImage,
        user_id: user.id
      });
      
      if (result.success && result.memorial) {
        toast({
          title: "Memorial Created",
          description: `${formData.fullName}'s memorial has been created successfully.`,
          variant: "success",
        });
        navigate(`/memorial/${result.memorial.id}`);
      } else {
        throw new Error(result.error || "Failed to create memorial");
      }
    } catch (error: unknown) {
      console.error("Error creating memorial:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error creating memorial",
        description: message || "There was a problem creating the memorial.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-memorial-800 mb-4">Create a Memorial</h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Honor and remember your loved one by creating a memorial that preserves their story.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-serif text-memorial-700 mb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
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
                        placeholder="e.g. John Smith"
                      />
                    </div>
                    
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
                        <option value="aunt">Aunt</option>
                        <option value="child">Child</option>
                        <option value="colleague">Colleague</option>
                        <option value="cousin">Cousin</option>
                        <option value="ex-spouse">Ex-Spouse</option>
                        <option value="family-friend">Family Friend</option>
                        <option value="friend">Friend</option>
                        <option value="godchild">Godchild</option>
                        <option value="godparent">Godparent</option>
                        <option value="grandchild">Grandchild</option>
                        <option value="grandparent">Grandparent</option>
                        <option value="half-sibling">Half-Sibling</option>
                        <option value="in-law">In-Law</option>
                        <option value="mentor">Mentor</option>
                        <option value="neighbor">Neighbor</option>
                        <option value="niece">Niece</option>
                        <option value="other">Other</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="spouse">Spouse/Partner</option>
                        <option value="stepchild">Stepchild</option>
                        <option value="stepparent">Stepparent</option>
                        <option value="stepsibling">Step-Sibling</option>
                        <option value="student">Student</option>
                        <option value="uncle">Uncle</option>
                      </select>
                    </div>
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
                      Brief Description
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
                  
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-memorial-400 transition-colors">
                    <input
                      type="file"
                      id="coverPhoto"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="coverPhoto" className="cursor-pointer block">
                      <Upload className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-600 mb-1">
                        {selectedFile ? selectedFile.name : "Drag a photo here or click to upload"}
                      </p>
                      <p className="text-neutral-500 text-sm">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </label>
                  </div>
                </div>
                
                {/* Tone & Style Settings */}
                <div>
                  <h2 className="text-xl font-serif text-memorial-700 mb-4">Narrative Voice</h2>
                  <p className="text-neutral-600 mb-4">
                    Choose the tone and style that best reflects your loved one's personality for the AI-generated narrative.
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-neutral-700 mb-3">Tone</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                </div>
                
                {/* Privacy Settings */}
                <div>
                  <h2 className="text-xl font-serif text-memorial-700 mb-4">Privacy Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PrivacyOptions.map((option) => (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.privacy === option.id 
                            ? 'border-memorial-500 bg-memorial-50' 
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => handlePrivacyChange(option.id)}
                      >
                        <div className="flex mb-2">
                          {option.icon}
                          <span className="ml-2 font-medium">{option.label}</span>
                        </div>
                        <p className="text-sm text-neutral-600">{option.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-md font-medium text-white transition-colors ${
                      isSubmitting 
                        ? 'bg-memorial-400 cursor-not-allowed'
                        : 'bg-memorial-600 hover:bg-memorial-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader size={20} className="animate-spin mr-2" />
                        Creating Memorial...
                      </span>
                    ) : 'Create Memorial'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateMemorial;