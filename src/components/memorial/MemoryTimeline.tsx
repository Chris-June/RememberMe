import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, ArrowDownCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Memory } from '../../types';
import MemoryCard from './MemoryCard';
import EmotionBadge from './EmotionBadge';

interface MemoryTimelineProps {
  memories: Memory[];
  onDeleteMemory?: (memoryId: string) => void;
}

const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ memories, onDeleteMemory }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [localMemories, setLocalMemories] = useState<Memory[]>(memories);

  React.useEffect(() => {
    setLocalMemories(memories);
  }, [memories]);

  const filteredMemories = selectedEmotion === 'all'
    ? localMemories
    : localMemories.filter(memory => memory.emotion === selectedEmotion);

  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    // Reset visible count when filter changes
    setVisibleCount(5);
  };

  const handleDeleteMemory = (memoryId: string) => {
    setLocalMemories(prev => prev.filter(m => m.id !== memoryId));
    if (onDeleteMemory) onDeleteMemory(memoryId);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'joyful', 'funny', 'thoughtful', 'bittersweet', 'sad'].map((emotion) => (
          <EmotionBadge 
            key={emotion} 
            emotion={emotion} 
            selected={selectedEmotion === emotion}
            onClick={() => handleEmotionSelect(emotion)}
          />
        ))}
      </div>
      
      <div className="space-y-8">
        {filteredMemories.slice(0, visibleCount).map((memory, index) => (
          <motion.div 
            key={memory.id} 
            className="timeline-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="mb-2 flex items-center text-sm text-neutral-500">
              <Clock size={14} className="mr-1" />
              <span>{memory.date ? format(new Date(memory.date), 'MMMM d, yyyy') : memory.timePeriod || 'No date'}</span>
            </div>
            <MemoryCard 
              memory={memory}
              onDeleteMemory={handleDeleteMemory}
            />
          </motion.div>
        ))}
      </div>
      
      {visibleCount < filteredMemories.length && (
        <div className="mt-8 text-center">
          <button 
            onClick={loadMore}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <ArrowDownCircle size={18} /> Load More Memories
          </button>
        </div>
      )}
      
      {filteredMemories.length === 0 && (
        <div className="text-center py-8 bg-neutral-50 rounded-lg">
          <p className="text-neutral-600">No memories found with this filter.</p>
        </div>
      )}
    </div>
  );
};

export default MemoryTimeline;