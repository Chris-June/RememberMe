import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, Clock, BookOpen, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-memorial-900 mb-6">
              Memories <span className="text-memorial-600">Live On</span> Through Stories
            </h1>
            <p className="text-xl md:text-2xl text-neutral-700 max-w-3xl mx-auto mb-10">
              Transform collective memories into AI-generated life narratives, written in the voice of those you cherish.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/create" className="btn-primary text-lg px-8 py-3">
                Create Memorial
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-12 md:mt-16 bg-white rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <img 
              src="https://images.pexels.com/photos/7303158/pexels-photo-7303158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Family reviewing memories together" 
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-100" id="how-it-works">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-memorial-800 mb-4">How It Works</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Our platform makes it easy to collect and transform memories into meaningful narratives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-memorial-500" />,
                title: "Collect Memories",
                description: "Invite family and friends to contribute their unique memories and perspectives."
              },
              {
                icon: <Clock className="h-10 w-10 text-memorial-500" />,
                title: "Organize Timeline",
                description: "Stories are automatically organized chronologically, creating a life timeline."
              },
              {
                icon: <BookOpen className="h-10 w-10 text-memorial-500" />,
                title: "Generate Narrative",
                description: "Our AI transforms fragmented memories into a cohesive life story."
              },
              {
                icon: <Heart className="h-10 w-10 text-memorial-500" />,
                title: "Share & Preserve",
                description: "Share privately with loved ones or preserve for future generations."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.4 }}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-serif font-semibold text-memorial-700 mb-3">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-memorial-50 rounded-xl p-8 md:p-12 shadow-md">
            <div className="max-w-3xl mx-auto text-center">
              <svg className="w-12 h-12 text-memorial-300 mx-auto mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-xl md:text-2xl font-serif text-neutral-700 mb-8">
                "After losing my father, we created a memorial where everyone contributed their memories. The AI-generated narrative captured his voice so authentically that it felt like he was telling his own story. It's become our most treasured keepsake."
              </p>
              <div>
                <h4 className="font-serif font-semibold text-memorial-700">Sarah Johnson</h4>
                <p className="text-neutral-500">Memorial Creator</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-memorial-800 text-white px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to Create a Digital Memorial?</h2>
          <p className="text-lg text-memorial-100 mb-8 max-w-2xl mx-auto">
            Start preserving precious memories and stories today. Create a beautiful, collaborative memorial that captures the essence of your loved one.
          </p>
          <Link 
            to="/create" 
            className="inline-flex items-center bg-white text-memorial-800 hover:bg-memorial-100 px-8 py-3 rounded-md shadow transition-colors"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;