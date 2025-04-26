import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import UserMenu from '../Header/UserMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const headerClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  );

  const logoClasses = cn(
    'flex items-center gap-2 font-serif font-semibold text-xl',
    isScrolled ? 'text-memorial-800' : 'text-memorial-700'
  );

  const navItemClasses = 'text-lg font-medium hover:text-memorial-600 transition-colors';

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className={logoClasses}>
          <BookHeart className="h-6 w-6" />
          <span>Remembering Me</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={navItemClasses}>Home</Link>
          <Link to="/create" className={navItemClasses}>Create Memorial</Link>
          <Link to="/dashboard" className={navItemClasses}>Dashboard</Link>
          <UserMenu />
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-memorial-800"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <nav className="flex flex-col py-4 px-6 space-y-4">
            <Link to="/" className={navItemClasses}>Home</Link>
            <Link to="/create" className={navItemClasses}>Create Memorial</Link>
            <Link to="/dashboard" className={navItemClasses}>Dashboard</Link>
            <div className="pt-2 border-t border-neutral-200">
              <UserMenu />
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;