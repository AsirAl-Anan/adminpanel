import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
// Custom toast functions are now used
import { showSuccessToast, showErrorToast } from '../toast/Toast';
import TopicAddOrEditModal from '../modals/TopicEditOrAddModal';

const TopicList = ({ subjectId, chapterIndex, topics, onUpdate }) => {
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- UPDATED: Initial state now uses the correct object-of-arrays structure for aliases ---
  const getInitialTopicState = () => ({
    name: { english: '', bangla: '' },
    description: { english: '', bangla: '' },
    topicCode: '',
    index: 0,
    type: '',
    aliases: { english: [], bangla: [], banglish: [] }, // Ensure top-level aliases match the structure
    questionTypes: [{ english: '', bangla: '' }],
    segments: [{
      title: { english: '', bangla: '' },
      description: { english: '', bangla: '' },
      aliases: { english: [], bangla: [], banglish: [] }, // Use the correct object structure
      images: [],
      formulas: []
    }]
  });

  const [newTopic, setNewTopic] = useState(getInitialTopicState());

  useEffect(() => {
    console.log(newTopic);
  }, [newTopic]);

  const initializeForm = (topic = null, index = null) => {
    if (topic) {
      // Edit mode - populate with existing data
      setIsEditMode(true);
      setEditingTopicIndex(index);
      setNewTopic({
        name: { english: topic.englishName || '', bangla: topic.banglaName || '' },
        description: { english: topic.englishDescription || '', bangla: topic.banglaDescription || '' },
        topicCode: topic.topicCode || '',
        index: topic.index !== undefined ? topic.index : 0,
        type: topic.type || 'theory',
        // --- UPDATED: No transformation needed. Use data directly from API. ---
        aliases: topic.aliases || { english: [], bangla: [], banglish: [] },
        questionTypes: topic.questionTypes?.length > 0 ? topic.questionTypes : [],
        segments: topic.segments?.length > 0 ? topic.segments.map(seg => ({
          ...seg,
          // --- UPDATED: Also use segment aliases directly. ---
          aliases: seg.aliases || { english: [], bangla: [], banglish: [] },
          images: seg.images?.map(img => ({
            url: img.url,
            title: img.title || { english: '', bangla: '' },
            description: img.description || { english: '', bangla: '' }
          })) || []
        })) : [],
      });
    } else {
      // Add mode - reset to default state
      setIsEditMode(false);
      setEditingTopicIndex(null);
      setNewTopic(getInitialTopicState());
    }
  };

  const openAddEditModal = (topic = null, index = null) => {
    initializeForm(topic, index);
    setIsAddEditModalOpen(true);
    setIsTopicsModalOpen(false);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
  };

  const openTopicsModal = () => setIsTopicsModalOpen(true);
  const closeTopicsModal = () => setIsTopicsModalOpen(false);

  const prepareDataForApi = (topicState) => {
    return {
      englishName: topicState.name.english,
      banglaName: topicState.name.bangla,
      englishDescription: topicState.description.english,
      banglaDescription: topicState.description.bangla,
      topicCode: topicState.topicCode,
      index: topicState.index,
      type: topicState.type,
      // --- UPDATED: No transformation needed. The state is already in the correct format for the API. ---
      questionTypes: topicState.questionTypes.filter(qt => qt.english?.trim() || qt.bangla?.trim()),
      segments: topicState.segments.map(seg => ({
        ...seg,
        // --- UPDATED: Segment aliases are also in the correct format. ---
        aliases: seg.aliases,
        images: seg.images.map(img => ({
          title: img.title,
          description: img.description,
          ...(img.url && { url: img.url })
        }))
      }))
    };
  };

  // --- CRUD Operations (Updated with custom toasts) ---
  const handleAddTopic = async () => {
    if (!newTopic.name.english || !newTopic.name.bangla) {
      showErrorToast("English and Bangla Topic Names are required."); // <-- Updated
      return;
    }
    setLoading(true);
    try {
      const topicDataForApi = prepareDataForApi(newTopic);
      const formData = new FormData();
      topicDataForApi.segments.forEach((seg) => {
        seg.uniqueKey = Date.now().toString() + `${Math.random(6)}`
      })
      formData.append('topicData', JSON.stringify(topicDataForApi));

      newTopic.segments.forEach((segment, segIdx) => {
        segment.images.forEach((img, imgIdx) => {
          if (img.file) {
            formData.append(`segment_${segIdx}_image_${imgIdx}`, img.file);
          }
        });
      });

      const response = await axios.put(
        `/subject/${subjectId}/chapters/${chapterIndex}/topics`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        showSuccessToast('Topic added successfully'); // <-- Updated
        onUpdate();
        closeAddEditModal();
      } else {
        showErrorToast(response.data.message || 'Failed to add topic'); // <-- Updated
      }
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.message || 'Failed to add topic'); // <-- Updated
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopic = async () => {
    if (!newTopic.name.english || !newTopic.name.bangla) {
      showErrorToast("English and Bangla Topic Names are required."); // <-- Updated
      return;
    }
    setLoading(true);
    try {
      const topicDataForApi = prepareDataForApi(newTopic);
      const formData = new FormData();
      formData.append('editableData', JSON.stringify(topicDataForApi));

      newTopic.segments.forEach((segment, segIdx) => {
        segment.images.forEach((img, imgIdx) => {
          if (img.file) {
            formData.append(`segment_${segIdx}_image_${imgIdx}`, img.file);
          }
        });
      });

      const response = await axios.put(
        `/subject/${subjectId}/chapters/${chapterIndex}/topics/${editingTopicIndex}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        showSuccessToast('Topic updated successfully'); // <-- Updated
        onUpdate();
        closeAddEditModal();
      } else {
        showErrorToast(response.data.message || 'Failed to update topic'); // <-- Updated
      }
    } catch (err) {
      console.log("err", err);
      showErrorToast(err.response?.data?.message || 'Failed to update topic'); // <-- Updated
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topicIndex) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      const response = await axios.delete(`/subject/${subjectId}/chapters/${chapterIndex}/topics/${topicIndex}`);
      if (response.data.success) {
        showSuccessToast('Topic deleted successfully'); // <-- Updated
        onUpdate();
      } else {
        showErrorToast(response.data.message || 'Failed to delete topic'); // <-- Updated
      }
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to delete topic'); // <-- Updated
    }
  };

  return (
    <>
      {/* --- JSX (No changes needed here) --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Topic Management</h2>
            <p className="text-gray-600 text-sm">
              {topics?.length || 0} topics • Organize and manage educational content
            </p>
          </div>
        </div>
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 font-medium text-lg">{topics?.length || 0}</p>
                <p className="text-blue-600 text-sm font-medium">Total Topics</p>
              </div>
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openTopicsModal}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-medium group"
          >
            <svg className="w-5 h-5 mr-2 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Show Topics
          </button>
          <button
            onClick={() => openAddEditModal()}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Topic
          </button>
        </div>
      </div>

      {isTopicsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Topics List</h2>
                  <p className="text-blue-100 text-sm">{topics?.length || 0} topics available</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => openAddEditModal()} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"> Add Topic </button>
                  <button onClick={closeTopicsModal} className="p-2 hover:bg-blue-800 rounded-lg transition-colors" aria-label="Close modal">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {topics?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.map((topic, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors line-clamp-1">{topic.englishName}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">{topic.banglaName}</p>
                      <div className="flex gap-2 pt-3 border-t border-gray-200 mt-4">
                        <button onClick={() => openAddEditModal(topic, idx)} className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"> Edit </button>
                        <button onClick={() => handleDeleteTopic(idx)} className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"> Delete </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first topic.</p>
                  <button onClick={() => openAddEditModal()} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl"> Create First Topic </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddEditModalOpen && (
        <TopicAddOrEditModal
          isEditMode={isEditMode}
          closeAddEditModal={closeAddEditModal}
          newTopic={newTopic}
          setNewTopic={setNewTopic}
          handleAddTopic={handleAddTopic}
          handleEditTopic={handleEditTopic}
          loading={loading}
        />
      )}
    </>
  );
};

export default TopicList;