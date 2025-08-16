// components/TopicList.js
import React, { useState } from 'react';
import axios from '../../config/axios';

const TopicList = ({ subjectId, chapterIndex, topics, onUpdate }) => {
  console.log("subjectId:", subjectId);
  const [isTopicsVisible, setIsTopicsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState({
    englishName: '',
    banglaName: '',
    topicCode: '',
    englishDescription: '',
    banglaDescription: '',
    images: [],
    formulas: [
      {
        equation: '',
        derivation: '',
        explanation: ''
      }
    ],
    aliases: {
      english: [''],
      bangla: [''],
      banglish: ['']
    }
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  const toggleTopicsVisibility = () => {
    setIsTopicsVisible(!isTopicsVisible);
  };

  const openModal = (topic = null, index = null) => {
    if (topic) {
      // Edit mode
      setIsEditMode(true);
      setEditingTopicIndex(index);
      setNewTopic({
        englishName: topic.englishName || '',
        banglaName: topic.banglaName || '',
        topicCode: topic.topicCode || '',
        englishDescription: topic.englishDescription || '',
        banglaDescription: topic.banglaDescription || '',
        images: topic.images || [],
        formulas: topic.formulas && topic.formulas.length > 0 
          ? topic.formulas 
          : [{ equation: '', derivation: '', explanation: '' }],
        aliases: {
          english: topic.aliases?.english || [''],
          bangla: topic.aliases?.bangla || [''],
          banglish: topic.aliases?.banglish || ['']
        }
      });
      // Set image previews for existing images
      setImagePreviews(topic.images?.map(img => img.url) || []);
    } else {
      // Add mode
      setIsEditMode(false);
      setEditingTopicIndex(null);
      setNewTopic({
        englishName: '',
        banglaName: '',
        topicCode: '',
        englishDescription: '',
        banglaDescription: '',
        images: [],
        formulas: [{ equation: '', derivation: '', explanation: '' }],
        aliases: {
          english: [''],
          bangla: [''],
          banglish: ['']
        }
      });
      setImagePreviews([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTopicIndex(null);
    setNewTopic({
      englishName: '',
      banglaName: '',
      topicCode: '',
      englishDescription: '',
      banglaDescription: '',
      images: [],
      formulas: [{ equation: '', derivation: '', explanation: '' }],
      aliases: {
        english: [''],
        bangla: [''],
        banglish: ['']
      }
    });
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    setNewTopic(prev => ({
      ...prev,
      images: [
        ...prev.images,
        ...files.map(file => ({
          file,
          title: '' // Initialize with empty title
        }))
      ]
    }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewTopic(prev => {
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
  };

  const updateImageTitle = (index, title) => {
    setNewTopic(prev => {
      const updatedImages = [...prev.images];
      updatedImages[index] = { ...updatedImages[index], title };
      return { ...prev, images: updatedImages };
    });
  };

  const handleAddTopic = async () => {
    if (!newTopic.englishName || !newTopic.banglaName || !newTopic.topicCode) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `/subject/${subjectId}/chapters/${chapterIndex}/topics`,
        { topic: newTopic },
        { withCredentials: true }
      );
      onUpdate();
      closeModal();
    } catch (err) {
      console.error('Failed to add topic:', err);
      alert('Failed to add topic');
    } finally {
      setLoading(false);
    }
  };

const handleEditTopic = async () => {
  if (!newTopic.englishName || !newTopic.banglaName || !newTopic.topicCode) return;

  setLoading(true);
  try {
    const formData = new FormData();
    
    // Append only changed fields
    const originalTopic = topics[editingTopicIndex];
    let hasChanges = false;
    
    if (newTopic.englishName !== originalTopic.englishName) {
      formData.append('englishName', newTopic.englishName);
      hasChanges = true;
    }
    if (newTopic.banglaName !== originalTopic.banglaName) {
      formData.append('banglaName', newTopic.banglaName);
      hasChanges = true;
    }
    if (newTopic.topicCode !== originalTopic.topicCode) {
      formData.append('topicCode', newTopic.topicCode);
      hasChanges = true;
    }
    if (newTopic.englishDescription !== (originalTopic.englishDescription || '')) {
      formData.append('englishDescription', newTopic.englishDescription);
      hasChanges = true;
    }
    if (newTopic.banglaDescription !== (originalTopic.banglaDescription || '')) {
      formData.append('banglaDescription', newTopic.banglaDescription);
      hasChanges = true;
    }
    
    // Handle aliases
    const originalAliases = originalTopic.aliases || { english: [], bangla: [], banglish: [] };
    if (JSON.stringify(newTopic.aliases) !== JSON.stringify(originalAliases)) {
      formData.append('aliases', JSON.stringify(newTopic.aliases));
      hasChanges = true;
    }
    
    // Handle formulas
    const originalFormulas = originalTopic.formulas || [];
    if (JSON.stringify(newTopic.formulas) !== JSON.stringify(originalFormulas)) {
      formData.append('formulas', JSON.stringify(newTopic.formulas));
      hasChanges = true;
    }
    
    // Handle new images
    const newImages = newTopic.images.filter(img => img.file);
    if (newImages.length > 0) {
      newImages.forEach((img) => {
        formData.append('images', JSON.stringify({ file: img.file, title: img.title }));
      });
      
      hasChanges = true;
    }
    
    // Handle existing image title updates
    const existingImages = newTopic.images.filter(img => !img.file);
    const titleUpdates = existingImages
      .map((img, index) => {
        const originalImg = originalTopic.images.find(o => o.url === img.url);
        if (originalImg && img.title !== originalImg.title) {
          return { index: newTopic.images.indexOf(img), title: img.title };
        }
        return null;
      })
      .filter(Boolean);
    
    if (titleUpdates.length > 0) {
      formData.append('updatedImageTitles', JSON.stringify(titleUpdates));
      hasChanges = true;
    }
    
    // Debug: Log FormData contents
    console.log('FormData contents being sent:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    // If no changes, show message and return
    if (!hasChanges && newImages.length === 0 && titleUpdates.length === 0) {
      alert('No changes detected');
      setLoading(false);
      return;
    }
    
    // Send the FormData directly (not wrapped in an object)
    await axios.put(
      `/subject/${subjectId}/chapters/${chapterIndex}/topics/${editingTopicIndex}`,
      formData, // Send formData directly
      {
        headers: { 
          'Content-Type': 'multipart/form-data' // This is important
        },
        withCredentials: true
      }
    );
    
    onUpdate();
    closeModal();
  } catch (err) {
    console.error('Failed to edit topic:', err);
    alert('Failed to edit topic: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  const handleDeleteTopic = async (topicIndex) => {
    const confirm = window.confirm('Are you sure you want to delete this topic?');
    if (!confirm) return;

    try {
      await axios.delete(`/subject/${subjectId}/chapters/${chapterIndex}/topics/${topicIndex}`);
      onUpdate();
    } catch (err) {
      alert('Failed to delete topic');
    }
  };

  // Formula management functions
  const addFormula = () => {
    setNewTopic({
      ...newTopic,
      formulas: [
        ...newTopic.formulas,
        {
          equation: '',
          derivation: '',
          explanation: ''
        }
      ]
    });
  };

  const updateFormula = (index, field, value) => {
    const updatedFormulas = [...newTopic.formulas];
    updatedFormulas[index][field] = value;
    setNewTopic({
      ...newTopic,
      formulas: updatedFormulas
    });
  };

  const removeFormula = (index) => {
    if (newTopic.formulas.length <= 1) return;
    const updatedFormulas = newTopic.formulas.filter((_, i) => i !== index);
    setNewTopic({
      ...newTopic,
      formulas: updatedFormulas
    });
  };

  // Alias management functions
  const updateAlias = (lang, index, value) => {
    const updatedAliases = [...newTopic.aliases[lang]];
    updatedAliases[index] = value;
    setNewTopic({
      ...newTopic,
      aliases: {
        ...newTopic.aliases,
        [lang]: updatedAliases
      }
    });
  };

  const addAliasField = (lang) => {
    const updatedAliases = [...newTopic.aliases[lang], ''];
    setNewTopic({
      ...newTopic,
      aliases: {
        ...newTopic.aliases,
        [lang]: updatedAliases
      }
    });
  };

  const removeAliasField = (lang, index) => {
    const updatedAliases = newTopic.aliases[lang].filter((_, i) => i !== index);
    setNewTopic({
      ...newTopic,
      aliases: {
        ...newTopic.aliases,
        [lang]: updatedAliases
      }
    });
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={toggleTopicsVisibility}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          {isTopicsVisible ? 'Hide Topics' : 'Show Topics'}
        </button>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
        >
          Add Topic
        </button>
      </div>

      {/* Topics List */}
      {isTopicsVisible && (
        <ul className="list-disc pl-5 space-y-3">
          {topics.map((topic, idx) => (
            <li 
              key={idx} 
              className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className="font-medium text-gray-800">
                  {topic.englishName} ({topic.banglaName})
                </span>
                <span className="ml-2 text-sm text-gray-500">- {topic.topicCode}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(topic, idx)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTopic(idx)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal for Adding/Editing Topic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {isEditMode ? 'Edit Topic' : 'Add New Topic'}
            </h3>

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name
                </label>
                <input
                  type="text"
                  value={newTopic.englishName}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, englishName: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bangla Name
                </label>
                <input
                  type="text"
                  value={newTopic.banglaName}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, banglaName: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Code
                </label>
                <input
                  type="text"
                  value={newTopic.topicCode}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, topicCode: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Description
              </label>
              <textarea
                value={newTopic.englishDescription}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, englishDescription: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bangla Description
              </label>
              <textarea
                value={newTopic.banglaDescription}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, banglaDescription: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="flex flex-wrap gap-4 mb-3">
                {newTopic.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image.file ? URL.createObjectURL(image.file) : image.url} 
                      alt={`Preview ${index}`} 
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <input
                      type="text"
                      value={image.title || ''}
                      onChange={(e) => updateImageTitle(index, e.target.value)}
                      placeholder="Image title"
                      className="w-full mt-1 p-1 text-sm border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Formulas Section */}
            <fieldset className="border border-gray-300 p-4 rounded-lg mb-6">
              <legend className="text-sm font-medium text-gray-700 px-2">
                Formulas
              </legend>
              {newTopic.formulas.map((formula, idx) => (
                <div key={idx} className="border border-gray-200 p-4 rounded mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">Formula {idx + 1}</h4>
                    {newTopic.formulas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormula(idx)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Equation
                      </label>
                      <input
                        type="text"
                        value={formula.equation}
                        onChange={(e) => updateFormula(idx, 'equation', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Derivation
                      </label>
                      <input
                        type="text"
                        value={formula.derivation}
                        onChange={(e) => updateFormula(idx, 'derivation', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Explanation
                      </label>
                      <textarea
                        value={formula.explanation}
                        onChange={(e) => updateFormula(idx, 'explanation', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFormula}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Formula
              </button>
            </fieldset>

            {/* Aliases */}
            {['english', 'bangla', 'banglish'].map((lang) => (
              <div key={lang} className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang.charAt(0).toUpperCase() + lang.slice(1)} Aliases
                </label>
                <div className="space-y-2">
                  {newTopic.aliases[lang].map((alias, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={alias}
                        onChange={(e) => updateAlias(lang, idx, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeAliasField(lang, idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addAliasField(lang)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add {lang} alias
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleEditTopic : handleAddTopic}
                disabled={loading}
                className={`px-4 py-2 rounded text-white transition-colors duration-200 ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </span>
                ) : isEditMode ? 'Update Topic' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicList;