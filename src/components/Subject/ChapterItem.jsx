import React, { useState } from 'react';
import axios from '../../config/axios';
import TopicList from './TopicList';
import { Edit, Trash2, ChevronDown, BookOpen } from 'lucide-react';

const ChapterItem = ({ chapter, subjectId, onUpdate, onEdit , subjectGroup, subjectLevel}) => {
  const [loading, setLoading] = useState(false);
  const [isTopicsVisible, setIsTopicsVisible] = useState(false);

  const handleDeleteChapter = async () => {
    if (window.confirm('Are you sure you want to delete this chapter and all its topics? This action cannot be undone.')) {
      setLoading(true);
      try {
        await axios.delete(`/subject/chapters/${chapter._id}`);
        onUpdate();
      } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Failed to delete chapter. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const topicCount = chapter.topics?.length || 0;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:border-primary transition-all duration-300 flex flex-col">
      {/* Card Header: Chapter Info & Actions */}
      <div className="p-5">
        <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
                <h3 className="font-bold text-base text-foreground leading-tight">
                    {`Ch. ${chapter.chapterNo}: ${chapter.name?.en || 'Untitled'}`}
                </h3>
                <p className="text-sm text-muted-foreground">{chapter.name?.bn}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onEdit} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit Chapter"><Edit size={14} /></button>
                <button onClick={handleDeleteChapter} disabled={loading} className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50" aria-label="Delete Chapter"><Trash2 size={14} /></button>
            </div>
        </div>
        
        {/* Simplified Topic Count Display */}
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <BookOpen size={14} className="mr-2"/>
            <span>{topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}</span>
        </div>
      </div>
      
      {/* Expandable Topic List Section */}
      <div className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isTopicsVisible ? 'max-h-[1000px] p-5 pt-0' : 'max-h-0'}`}>
        <div className="border-t border-border pt-4">
            <TopicList
                subjectId={subjectId}
                chapterId={chapter._id}
                topics={chapter.topics}
                onUpdate={onUpdate}
                subjectGroup={subjectGroup}
                subjectLevel={subjectLevel}
            />
        </div>
      </div>

      {/* Card Footer: Toggle Button */}
      <div className="border-t border-border p-3">
        <button 
          onClick={() => setIsTopicsVisible(!isTopicsVisible)}
          className="w-full flex items-center justify-center text-center px-4 py-2 bg-secondary text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors group"
        >
          <span>{isTopicsVisible ? 'Minimize' : 'Expand'}</span>
          <ChevronDown className={`ml-2 transition-transform duration-300 ${isTopicsVisible ? 'rotate-180' : ''}`} size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChapterItem
