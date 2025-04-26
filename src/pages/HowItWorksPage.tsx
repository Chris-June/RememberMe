import { motion } from 'framer-motion';
import { Users, Clock, BookOpen, Heart, ArrowRight } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="px-4 mb-16">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-memorial-800 mb-6">
              How Remembering Me Works
            </h1>
            <p className="text-xl text-neutral-700 max-w-3xl mx-auto mb-10">
              Transform collective memories into meaningful narratives that capture the essence of your loved ones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="px-4 mb-16 bg-neutral-50 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-serif text-memorial-800 text-center mb-12">Four Simple Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-8 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-memorial-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                1
              </div>
              <Users className="h-14 w-14 text-memorial-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-memorial-700 mb-3">Create a Memorial</h3>
              <p className="text-neutral-600">
                Start by creating a memorial for your loved one with basic information and a photo.
              </p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-8 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-memorial-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                2
              </div>
              <Heart className="h-14 w-14 text-memorial-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-memorial-700 mb-3">Collect Memories</h3>
              <p className="text-neutral-600">
                Invite family and friends to contribute their stories, photos, and reflections.
              </p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-8 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-memorial-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                3
              </div>
              <Clock className="h-14 w-14 text-memorial-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-memorial-700 mb-3">Generate Narrative</h3>
              <p className="text-neutral-600">
                Our AI transforms collected memories into a cohesive life narrative in your loved one's voice.
              </p>
            </motion.div>
            
            {/* Step 4 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-8 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-memorial-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                4
              </div>
              <BookOpen className="h-14 w-14 text-memorial-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-memorial-700 mb-3">Share & Preserve</h3>
              <p className="text-neutral-600">
                Share the memorial with family or make it public to preserve their legacy for generations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="px-4 mb-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-serif text-memorial-800 text-center mb-12">The Details</h2>
          
          <div className="space-y-12">
            {/* Detail 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 md:flex gap-8">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <img 
                  src="https://images.pexels.com/photos/6963944/pexels-photo-6963944.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Creating a memorial" 
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-serif text-memorial-700 mb-4">Creating a Memorial</h3>
                <p className="text-neutral-700 mb-4">
                  Start by providing basic information about your loved one: their name, birth and passing dates, 
                  a cover photo, and a brief description. You can choose privacy settings to control who can view and contribute.
                </p>
                <ul className="list-disc list-inside text-neutral-600 space-y-2">
                  <li>Create a memorial in less than 5 minutes</li>
                  <li>Choose from privacy options: public, family-only, or private</li>
                  <li>Customize the memorial with photos and personal details</li>
                </ul>
              </div>
            </div>
            
            {/* Detail 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 md:flex gap-8">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <img 
                  src="https://images.pexels.com/photos/6963821/pexels-photo-6963821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Collecting memories" 
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-serif text-memorial-700 mb-4">Collecting Memories</h3>
                <p className="text-neutral-700 mb-4">
                  Share the memorial link with family and friends, inviting them to contribute their memories. 
                  Each memory can include text, photos, emotional context, and the time period it occurred.
                </p>
                <ul className="list-disc list-inside text-neutral-600 space-y-2">
                  <li>Easily invite contributors via email or shareable link</li>
                  <li>Collect diverse perspectives from different relationships</li>
                  <li>Organize memories chronologically in an interactive timeline</li>
                </ul>
              </div>
            </div>
            
            {/* Detail 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 md:flex gap-8">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <img 
                  src="https://images.pexels.com/photos/5212703/pexels-photo-5212703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Generating narrative" 
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-serif text-memorial-700 mb-4">Generating the Narrative</h3>
                <p className="text-neutral-700 mb-4">
                  Using advanced AI, we transform the collected memories into a cohesive life narrative written in 
                  the first person, as if your loved one is telling their own story. The narrative evolves as more memories are added.
                </p>
                <ul className="list-disc list-inside text-neutral-600 space-y-2">
                  <li>AI-generated narrative that feels authentic and personal</li>
                  <li>Written in first-person perspective for emotional resonance</li>
                  <li>Regenerate the narrative anytime as new memories are added</li>
                </ul>
              </div>
            </div>
            
            {/* Detail 4 */}
            <div className="bg-white rounded-lg shadow-md p-8 md:flex gap-8">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <img 
                  src="https://images.pexels.com/photos/7103204/pexels-photo-7103204.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Sharing and preserving" 
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-serif text-memorial-700 mb-4">Sharing & Preserving</h3>
                <p className="text-neutral-700 mb-4">
                  Your memorial becomes a living tribute that can be shared with current and future generations. 
                  Control who can view it while ensuring these precious memories are preserved for years to come.
                </p>
                <ul className="list-disc list-inside text-neutral-600 space-y-2">
                  <li>Share the complete memorial via link or social media</li>
                  <li>Adjust privacy settings at any time</li>
                  <li>Create a lasting digital legacy that future generations can discover</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 mb-16 bg-memorial-800 text-white py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to Preserve Your Memories?</h2>
          <p className="text-xl text-memorial-100 mb-8 max-w-2xl mx-auto">
            Start creating a memorial today and transform your collective memories into a beautiful narrative tribute.
          </p>
          <a 
            href="/create" 
            className="inline-flex items-center bg-white text-memorial-800 hover:bg-memorial-100 px-8 py-3 rounded-md shadow transition-colors"
          >
            Create a Memorial <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;