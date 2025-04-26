import React from 'react';

interface EmotionBadgeProps {
  emotion: string;
  selected?: boolean;
  onClick?: () => void;
}

const EmotionBadge: React.FC<EmotionBadgeProps> = ({ 
  emotion, 
  selected = false,
  onClick 
}) => {
  const getClasses = () => {
    const baseClasses = `px-3 py-1 rounded-full text-sm transition-colors cursor-pointer`;
    
    if (emotion === 'all') {
      return `${baseClasses} ${
        selected 
          ? 'bg-neutral-700 text-white' 
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      }`;
    }
    
    if (emotion === 'joyful') {
      return `${baseClasses} ${
        selected 
          ? 'bg-green-600 text-white' 
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`;
    }
    
    if (emotion === 'funny') {
      return `${baseClasses} ${
        selected 
          ? 'bg-amber-600 text-white' 
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      }`;
    }
    
    if (emotion === 'thoughtful') {
      return `${baseClasses} ${
        selected 
          ? 'bg-blue-600 text-white' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`;
    }
    
    if (emotion === 'bittersweet') {
      return `${baseClasses} ${
        selected 
          ? 'bg-purple-600 text-white' 
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      }`;
    }
    
    if (emotion === 'sad') {
      return `${baseClasses} ${
        selected 
          ? 'bg-neutral-600 text-white' 
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`;
    }
    
    return `${baseClasses} bg-neutral-100 text-neutral-700 hover:bg-neutral-200`;
  };
  
  return (
    <span className={getClasses()} onClick={onClick}>
      {emotion === 'all' ? 'All' : emotion.charAt(0).toUpperCase() + emotion.slice(1)}
    </span>
  );
};

export default EmotionBadge;