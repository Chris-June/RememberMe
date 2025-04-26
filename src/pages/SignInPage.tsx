import { motion } from 'framer-motion';
import SignInForm from '../components/auth/SignInForm';

const SignInPage = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row"
        >
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <div className="max-w-md mx-auto md:mx-0 md:ml-auto">
              <h1 className="text-3xl md:text-4xl font-serif text-memorial-800 mb-4">Welcome Back</h1>
              <p className="text-neutral-600 mb-8">
                Sign in to continue preserving memories and sharing stories of your loved ones.
              </p>
              <div className="hidden md:block">
                <img 
                  src="https://images.pexels.com/photos/7303152/pexels-photo-7303152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Family memories" 
                  className="w-full h-[500px] object-cover rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-white p-8 rounded-lg shadow-md">
            <SignInForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;