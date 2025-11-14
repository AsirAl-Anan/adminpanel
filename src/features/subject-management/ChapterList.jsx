import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ChapterItem from './ChapterItem';
const ChapterList = ({ subject, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
 
  const handleOpenModal = (chapter = null) => {
    setEditingChapter(chapter);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingChapter(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    onUpdate();
    handleCloseModal();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-foreground">Chapter Management</h2>
            <p className="text-sm text-muted-foreground">Organize all chapters for this subject.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add New Chapter
        </button>
      </div>

      {subject?.chapters?.length > 0 ? (
        // THE FIX IS ON THIS LINE: Added `items-start` to the class list.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {subject.chapters.map((chapter) => (
            <ChapterItem
              key={chapter._id}
              chapter={chapter}
              subjectId={subject._id}
              subjectGroup={subject.group}
              subjectLevel={subject.level}
              subjectGroupName={subject.groupName}
              onUpdate={onUpdate}
              onEdit={() => handleOpenModal(chapter)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border-2 border-dashed border-border rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">No Chapters Found</h3>
          <p className="text-muted-foreground mt-1 text-sm">Get started by adding the first chapter.</p>
        </div>
      )}

      {isModalOpen && (
        <ChapterModal
          subject={subject}
          chapter={editingChapter}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ChapterList;