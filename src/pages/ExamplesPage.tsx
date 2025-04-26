import { motion } from 'framer-motion';
import { BookHeart } from 'lucide-react';

const ExamplesPage = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-12">
            <BookHeart className="h-12 w-12 text-memorial-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-serif text-memorial-800 mb-6">Memorial Examples</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Browse through these thoughtfully crafted memorials to see how others have preserved memories of their loved ones.
            </p>
          </div>

          <div className="space-y-12">
            {/* Example 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="Robert James Wilson" 
                    className="h-48 md:h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-2">Robert James Wilson</h2>
                  <p className="text-neutral-600 mb-4">1946 - 2020</p>
                  <p className="text-neutral-700 mb-4">
                    Robert's memorial brings together stories from former students, family members, and colleagues, 
                    painting a picture of a dedicated educator and storyteller who touched countless lives.
                  </p>
                  <p className="text-neutral-600 italic mb-6">
                    "A beloved father, grandfather, and storyteller who inspired generations with his passion for literature."
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-memorial-100 text-memorial-700 rounded-full text-sm">24 memories</span>
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">8 contributors</span>
                    <span className="px-3 py-1 bg-warm-100 text-warm-700 rounded-full text-sm">Family memorial</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://images.pexels.com/photos/3171130/pexels-photo-3171130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="Elizabeth Marie Johnson" 
                    className="h-48 md:h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-2">Elizabeth Marie Johnson</h2>
                  <p className="text-neutral-600 mb-4">1938 - 2022</p>
                  <p className="text-neutral-700 mb-4">
                    Elizabeth's memorial showcases her artistic achievements alongside personal stories from her children and grandchildren, 
                    creating a vibrant timeline of a creative and nurturing life.
                  </p>
                  <p className="text-neutral-600 italic mb-6">
                    "A loving mother and talented artist whose creativity and warmth continue to inspire all who knew her."
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-memorial-100 text-memorial-700 rounded-full text-sm">35 memories</span>
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">12 contributors</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Public memorial</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://images.pexels.com/photos/7470/startup-photos.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="James Thomas Smith" 
                    className="h-48 md:h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h2 className="text-2xl font-serif text-memorial-800 mb-2">James Thomas Smith</h2>
                  <p className="text-neutral-600 mb-4">1955 - 2023</p>
                  <p className="text-neutral-700 mb-4">
                    James' memorial highlights his entrepreneurial spirit and dedication to his family. Former business 
                    partners share professional insights while family members reveal the caring person behind the success.
                  </p>
                  <p className="text-neutral-600 italic mb-6">
                    "An entrepreneur and devoted family man who built businesses with integrity and a community-focused approach."
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-memorial-100 text-memorial-700 rounded-full text-sm">18 memories</span>
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">5 contributors</span>
                    <span className="px-3 py-1 bg-warm-100 text-warm-700 rounded-full text-sm">Family memorial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-neutral-700 mb-6">Ready to create your own memorial to preserve precious memories?</p>
            <a href="/create" className="btn-primary inline-block">Create a Memorial</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamplesPage;