import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Users, Calendar, Loader } from 'lucide-react';
import { format } from 'date-fns';
import MemorialActions from '../components/dashboard/MemorialActions';
import { useToast } from '../hooks/useToast';
import { getUserMemorials, deleteMemorial } from '../lib/memorials';
import { Memorial } from '../types';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created');
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user?.id) {
      fetchMemorials();
    }
  }, [user]);

  const fetchMemorials = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('memorials')
        .select('id, user_id')
        .eq('user_id', user.id)
        .order('createdat', { ascending: false });
      
      if (error) {
        console.error("Error fetching memorials:", error);
        toast({
          title: "Failed to load memorials",
          description: error.message || "There was a problem loading your memorials.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${data.length} memorials for user`);
      
      // Just use the minimal data for testing
      const memorials = data;

      setMemorials(memorials);
    } catch (error) {
      console.error("Error in fetchMemorials:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading your memorials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMemorial = async (id: string) => {
    try {
      const result = await deleteMemorial(id);
      if (result.success) {
        setMemorials(prev => prev.filter(memorial => memorial.id !== id));
        toast({
          title: "Memorial Deleted",
          description: "The memorial has been successfully deleted.",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to delete memorial",
          description: result.error || "There was a problem deleting the memorial.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting memorial:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the memorial.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-memorial-800 mb-2">Your Dashboard</h1>
            <p className="text-neutral-600">
              Manage your memorials and contributions from one place.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-neutral-200">
              <button
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'created' 
                    ? 'text-memorial-600 border-b-2 border-memorial-600' 
                    : 'text-neutral-600 hover:text-memorial-500'
                }`}
                onClick={() => setActiveTab('created')}
              >
                Created by You
              </button>
              <button
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'contributed' 
                    ? 'text-memorial-600 border-b-2 border-memorial-600' 
                    : 'text-neutral-600 hover:text-memorial-500'
                }`}
                onClick={() => setActiveTab('contributed')}
              >
                Contributed To
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Create Memorial Card */}
              <div className="mb-6">
                <Link
                  to="/create"
                  className="block bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-6 text-center hover:bg-neutral-100 transition-colors"
                >
                  <PlusCircle className="h-10 w-10 text-memorial-500 mx-auto mb-2" />
                  <h3 className="font-serif text-lg text-memorial-700 mb-1">Create New Memorial</h3>
                  <p className="text-neutral-600">Honor a loved one by creating a new memorial.</p>
                </Link>
              </div>

              {/* Memorial List */}
              {isLoading ? (
                <div className="text-center py-10">
                  <Loader size={30} className="animate-spin mx-auto mb-4 text-memorial-500" />
                  <p className="text-neutral-600">Loading your memorials...</p>
                </div>
              ) : memorials.length > 0 ? (
                <div className="space-y-4">
                  {memorials.map((memorial) => (
                    <div 
                      key={memorial.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 mr-4">
                            {memorial.coverImage && (
                              <img 
                                src={memorial.coverImage} 
                                alt={memorial.fullName} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <Link to={`/memorial/${memorial.id}`} className="font-serif font-medium text-memorial-700 hover:text-memorial-600">
                              {memorial.fullName}
                            </Link>
                            <div className="flex items-center text-sm text-neutral-500 mt-1">
                              <Calendar size={14} className="mr-1" />
                              <span>Created {memorial.createdat ? format(new Date(memorial.createdat), 'MMM d, yyyy') : 'Unknown Date'}</span>
                              <span className="mx-2">•</span>
                              <Users size={14} className="mr-1" />
                              <span>{memorial.contributorCount || 0} {(memorial.contributorCount === 1) ? 'contributor' : 'contributors'}</span>
                            </div>
                          </div>
                        </div>
                        <MemorialActions memorial={memorial} onDelete={handleDeleteMemorial} />
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {memorial.privacy === 'public' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Public
                          </span>
                        )}
                        {memorial.privacy === 'family' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Family Only
                          </span>
                        )}
                        {memorial.privacy === 'private' && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">
                            Private
                          </span>
                        )}
                        <span className="px-2 py-1 bg-memorial-100 text-memorial-800 text-xs rounded-full">
                          {memorial.memoryCount || 0} {(memorial.memoryCount === 1) ? 'memory' : 'memories'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-600 mb-4">You haven't {activeTab === 'created' ? 'created' : 'contributed to'} any memorials yet.</p>
                  {activeTab === 'created' && (
                    <Link to="/create" className="btn-primary">
                      Create Your First Memorial
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;