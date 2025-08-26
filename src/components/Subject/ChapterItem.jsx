// components/ChapterItem.js
import React from 'react';
import TopicList from './TopicList';

const ChapterItem = ({ chapter, subjectId, chapterIndex, onUpdate }) => {
  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold text-lg">{chapter.englishName} ({chapter.banglaName})</h3>
      <TopicList
        subjectId={subjectId}
        chapterIndex={chapterIndex}
        topics={chapter.topics}
        onUpdate={onUpdate}
        chapterName={{ bangla: chapter.banglaName, english: chapter.englishName }}
      />
    </div>
  );
};

export default ChapterItem;