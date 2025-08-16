// components/ChapterItem.js
import React, { useState } from 'react';
import TopicList from './TopicList'; // Assuming TopicList handles topics for a chapter
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid'; // Example icon import

// Simple Accordion Item Component (can be made reusable)
const AccordionItem = ({ title, children, isOpen, onToggle, icon }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className={`flex justify-between items-center w-full p-4 text-left font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </span>
        {isOpen ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const ChapterItem = ({ chapter, subjectId, chapterIndex, onUpdate }) => {
  const [isChapterOpen, setIsChapterOpen] = useState(false);
  const topicCount = chapter?.topics?.length || 0;

  const toggleChapter = () => {
    setIsChapterOpen(!isChapterOpen);
  };

  return (
    <li className="mb-2 rounded-lg shadow-sm border border-gray-200 overflow-hidden"> {/* Chapter Container */}
      <AccordionItem
        title={`${chapter.englishName} (${chapter.banglaName}) (${topicCount} topics)`}
        isOpen={isChapterOpen}
        onToggle={toggleChapter}
        icon={<span className="text-indigo-600 font-semibold">C{chapterIndex + 1}:</span>} // Optional: Add chapter identifier
      >
        {/* Chapter Content Area */}
        <div className="pl-4"> {/* Indent content */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-800">Topics</h4>
            <button
              onClick={() => { /* Logic to open Add Topic Modal/Section for this chapter */ }}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Topic
            </button>
          </div>
          {/* Pass props to TopicList to handle topics for this specific chapter */}
          <TopicList
            subjectId={subjectId}
            chapterIndex={chapterIndex}
            topics={chapter.topics}
            onUpdate={onUpdate}
            // Potentially pass isChapterOpen if TopicList needs to know
          />
        </div>
      </AccordionItem>
    </li>
  );
};

export default ChapterItem;