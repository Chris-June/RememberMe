import React from 'react';
import { Smile, DivideIcon as LucideIcon, Laugh, Heart, PenSquare, ThumbsDown } from 'lucide-react';

type Emotion = 'joyful' | 'funny' | 'thoughtful' | 'bittersweet' | 'sad';

interface EmotionOption {
  value: Emotion;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  hoverBgColor: string;
}

const emotions: EmotionOption[] = [
  { 
    value: 'joyful', 
    label: 'Joyful', 
    icon: Smile, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    hoverBgColor: 'hover:bg-green-200'
  },
  { 
    value: 'funny', 
    label: 'Funny', 
    icon: Laugh, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    hoverBgColor: 'hover:bg-amber-200'
  },
  { 
    value: 'thoughtful', 
    label: 'Thoughtful', 
    icon: PenSquare, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    hoverBgColor: 'hover:bg-blue-200'
  },
  { 
    value: 'bittersweet', 
    label: 'Bittersweet', 
    icon: Heart, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    hoverBgColor: 'hover:bg-purple-200'
  },
  { 
    value: 'sad', 
    label: 'Sad', 
    icon: ThumbsDown, 
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    hoverBgColor: 'hover:bg-neutral-200'
  }
];

interface EmotionSelectorProps {
  selectedEmotion: Emotion | '';
  onSelect: (emotion: Emotion) => void;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({ selectedEmotion, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {emotions.map((emotion) => {
        const Icon = emotion.icon;
        const isSelected = selectedEmotion === emotion.value;
        
        return (
          <button
            key={emotion.value}
            type="button"
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isSelected 
                ? `${emotion.color} bg-opacity-20 ${emotion.bgColor} border border-current` 
                : `text-neutral-600 bg-neutral-100 ${emotion.hoverBgColor} border border-transparent`
            }`}
            onClick={() => onSelect(emotion.value)}
          >
            <Icon size={16} className={isSelected ? emotion.color : ''} />
            <span>{emotion.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default EmotionSelector;