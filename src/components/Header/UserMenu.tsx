import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link to="/sign-in" className="text-lg font-medium hover:text-memorial-600 transition-colors">
          Sign In
        </Link>
        <Link to="/sign-up" className="btn-primary">
          Sign Up
        </Link>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button 
        onClick={toggleMenu}
        className="flex items-center gap-2 text-neutral-800 hover:text-memorial-600 transition-colors"
      >
        <div className="w-8 h-8 bg-memorial-100 rounded-full flex items-center justify-center">
          <User size={18} className="text-memorial-700" />
        </div>
        <span className="hidden md:block">{user.username || 'User'}</span>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={closeMenu}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 text-neutral-800">
            <div className="px-4 py-2 border-b border-neutral-100">
              <p className="font-medium truncate">{user.username || 'User'}</p>
              <p className="text-sm text-neutral-500 truncate">{user.email}</p>
            </div>
            
            <Link 
              to="/dashboard" 
              className="flex items-center px-4 py-2 hover:bg-neutral-50 transition-colors"
              onClick={closeMenu}
            >
              <Settings size={16} className="mr-2" />
              Dashboard
            </Link>
            
            <Link 
              to="/create" 
              className="flex items-center px-4 py-2 hover:bg-neutral-50 transition-colors"
              onClick={closeMenu}
            >
              <PlusCircle size={16} className="mr-2" />
              Create Memorial
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-neutral-50 transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;