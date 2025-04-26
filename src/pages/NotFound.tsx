import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookHeart, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4">
      <motion.div 
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BookHeart className="h-16 w-16 text-memorial-400 mx-auto mb-6" />
        <h1 className="text-4xl font-serif text-memorial-800 mb-4">Page Not Found</h1>
        <p className="text-neutral-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center">
          <Home className="mr-2 h-5 w-5" /> Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;