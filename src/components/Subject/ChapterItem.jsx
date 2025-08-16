// components/ChapterItem.js
import React from 'react';
import TopicList from './TopicList';

const ChapterItem = ({ chapter, subjectId, chapterIndex, onUpdate }) => {
  return (
    <li className="border p-4 rounded">
      <h3 className="font-bold text-lg">{chapter.englishName} ({chapter.banglaName})</h3>
      <TopicList
        subjectId={subjectId}
        chapterIndex={chapterIndex}
        topics={chapter.topics}
        onUpdate={onUpdate}
      />
    </li>
  );
};

export default ChapterItem;