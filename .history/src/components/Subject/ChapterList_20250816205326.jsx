import React, { useState } from 'react';
import axios from '../../config/axios';
import ChapterItem from './ChapterItem';
import AddChapterForm from './AddChapterForm';

const ChapterList = ({ subject, onUpdate }) => {
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  const toggleChapter = (chapterId) => {
    setExpandedChapterId(expandedChapterId === chapterId ? null : chapterId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Chapters</h2>
        <button
          onClick={() => setIsAddingChapter(!isAddingChapter)}
          className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition"
        >
          {isAddingChapter ? 'Cancel' : 'Add Chapter'}
        </button>
      </div>

      <ul className="space-y-3">
        {subject?.chapters?.map((chapter) => (
          <ChapterItem
            key={chapter._id}
            chapter={chapter}
            subjectId={subject._id}
            isExpanded={expandedChapterId === chapter._id}
            onToggle={() => toggleChapter(chapter._id)}
            onUpdate={onUpdate}
          />
        ))}
      </ul>

      {isAddingChapter && (
        <div className="mt-6 border-t pt-4">
          <AddChapterForm 
            subjectId={subject._id} 
            onCancel={() => setIsAddingChapter(false)}
            onSuccess={() => {
              setIsAddingChapter(false);
              onUpdate();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ChapterList;