import { Link } from 'react-router-dom';
import { BookHeart, Heart, Mail, Facebook, Twitter, Instagram, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-100 mt-16 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-serif font-semibold text-xl text-memorial-800 mb-4">
              <BookHeart className="h-6 w-6" />
              <span>Remembering Me</span>
            </Link>
            <p className="text-neutral-600 mb-4">
              Transform collective memories into AI-generated life narratives, preserving the essence of those we cherish.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-memorial-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-500 hover:text-memorial-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-500 hover:text-memorial-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="mailto:chris.june@intellisync.ca" className="text-neutral-500 hover:text-memorial-600 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-neutral-800 mb-4">Memorial</h4>
            <ul className="space-y-2">
              <li><Link to="/create" className="text-neutral-600 hover:text-memorial-600 transition-colors">Create Memorial</Link></li>
              <li><Link to="/dashboard" className="text-neutral-600 hover:text-memorial-600 transition-colors">Your Memorials</Link></li>
              <li><Link to="/examples" className="text-neutral-600 hover:text-memorial-600 transition-colors">Examples</Link></li>
              <li><Link to="/how-it-works" className="text-neutral-600 hover:text-memorial-600 transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-neutral-800 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/help-center" className="text-neutral-600 hover:text-memorial-600 transition-colors">Help Centre</Link></li>
              <li><Link to="/privacy-policy" className="text-neutral-600 hover:text-memorial-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-neutral-600 hover:text-memorial-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/accessibility" className="text-neutral-600 hover:text-memorial-600 transition-colors">Accessibility</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-neutral-800 mb-4">Contact</h4>
            <p className="text-neutral-600 mb-2">Questions or feedback?</p>
            <div className="space-y-2">
              <a 
                href="mailto:chris.june@intellisync.ca" 
                className="flex items-center text-memorial-600 hover:text-memorial-700 transition-colors"
              >
                <Mail size={16} className="mr-2" />
                chris.june@intellisync.ca
              </a>
              <a 
                href="tel:5193599712" 
                className="flex items-center text-memorial-600 hover:text-memorial-700 transition-colors"
              >
                <Phone size={16} className="mr-2" />
                519-359-9712
              </a>
              <a 
                href="https://home.intellisyncsolutions.io" 
                className="text-memorial-600 hover:text-memorial-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                home.intellisyncsolutions.io
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 pt-6 text-center text-neutral-600">
          <p>© {currentYear} Remembering Me. All rights reserved.</p>
          <p className="mt-2 text-sm flex items-center justify-center">
            Developed by Intellisync Solutions with <Heart size={16} className="text-warm-500 mx-1" /> in Canada
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;